import { Logger } from "../utils/Logger.js";
import {
  fetchAliasesByPattern,
  fetchIndexMappings,
  fetchIndexStats,
  filterRolloverIndices,
  findAllWriteIndexNames,
} from "./IndexAliasReads.js";
import {
  constructNewName,
  createIndices,
  enableWriteOnIndices,
  filterIndicesByMask,
  inferNewIndexMappings,
  setIndicesAsReadOnly,
} from "./IndexAliasWrites.js";

/**
 * Checking if there are indices that violate the rollover condition and returning them
 * @param {string} aliasPattern
 * @returns {Promise<{index: string, alias: string}[]>}
 */
export const fetchRolloverIndices = async (aliasPattern, condition) => {
  let step = "initial";
  const setStep = (d) => (step = d);
  try {
    setStep("fetch_aliases_by_pattern");
    const indices = await fetchAliasesByPattern(aliasPattern);

    setStep("find_all_write_index_names");
    const indicesAliases = findAllWriteIndexNames(indices);
    // console.log("find_all_write_index_names:", indicesAliases);

    setStep("fetch_index_stats");
    const statsPerIndex = await fetchIndexStats(
      indicesAliases.map(({ index }) => index)
    );
    // console.log("fetch_index_stats:", indicesAliases);

    setStep("filter_rollover_indices");
    const rolloverIndices = filterRolloverIndices(
      indicesAliases,
      statsPerIndex,
      condition
    );
    console.log("Rollover_Indices:", rolloverIndices);

    return rolloverIndices;
  } catch (error) {
    console.log({
      origin: "main.index",
      code: `fetchRolloverIndices.${step}`,
      message: error,
    });
  }
};

/**
 * Rolling over in this case is the process of creating a new write index
 * @param {{index: string, alias: string}[]} rolloverIndices
 * @returns {Promise}
 */
export const rollover = async (rolloverIndices) => {
  let step = "initial";
  const setStep = (d) => (step = d);
  try {
    setStep("fetch_index_mappings");
    const indexMappings = await fetchIndexMappings(
      rolloverIndices.map(({ index }) => index)
    );
    // console.log("fetch_index_mappings:", indexMappings);

    setStep("infer_new_indexMappings");
    const newIndexMappings = inferNewIndexMappings(indexMappings);
    // console.log("infer_new_indexMappings:", newIndexMappings);

    setStep("create_indices");
    // ========================================================================================;
    // The mask is a way to indicate which indices were succesfully created, and which were not
    // ========================================================================================;
    const fulfilledMask = await createIndices(newIndexMappings);
    Logger.green("fulfilled index creations:");
    console.log(fulfilledMask);

    setStep("filter_NEW_indices_by_mask");
    // ========================================================================================;
    // We use the mask to ONLY update aliases of succesfully created indices
    // ========================================================================================;
    const newIndexNames = Object.keys(newIndexMappings);
    const newIndicesAliases = newIndexNames.map((index) => {
      const alias = rolloverIndices.find(
        (indexAlias) => constructNewName(indexAlias.index) === index
      ).alias;
      return { index, alias };
    });
    const filteredNewIndices = filterIndicesByMask(
      newIndicesAliases,
      fulfilledMask
    );
    // console.log("filter_NEW_indices_by_mask", filteredNewIndices);

    setStep("filter_rollover_indices_by_mask");
    // ========================================================================================;
    // We also use the mask to ONLY update successfully rolledover indices
    // ========================================================================================;
    const filteredRollovers = rolloverIndices.filter(({ index }) => {
      const maskItem = fulfilledMask.find(
        (maskItem) => maskItem.index === constructNewName(index)
      );
      return maskItem.isFulfilled;
    });
    // console.log("filter_rollover_indices_by_mask", filteredRollovers);

    setStep("set_indices_as_read_only");
    const res2 = await setIndicesAsReadOnly(filteredRollovers);
    console.log("set_indices_as_read_only statusCode:", res2.statusCode);

    setStep("enable_write_on_indices");
    const res1 = await enableWriteOnIndices(filteredNewIndices);
    console.log("enable_write_on_indices statusCode:", res1.statusCode);

    //
  } catch (error) {
    console.log({
      origin: "main.index",
      code: `rollover.${step}`,
      message: error,
    });
  }
};
