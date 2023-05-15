import { client } from "../elastic/client.js";

export const constructNewName = (indexName) => {
  const regex = /(2[0-9]{3}[-_])?\d+$/g;
  const suffix = indexName.match(regex)?.[0];
  const year_num_arr = suffix?.split(/[-_]/);
  const yearSuffix =
    year_num_arr?.length > 1 ? new Date().getFullYear() + "-" : "";
  const numSuffix =
    year_num_arr?.length > 1 ? year_num_arr[1] : year_num_arr?.[0];
  const maxDigits = numSuffix?.length || 4;
  if (numSuffix) {
    const newNumSuffix = +numSuffix + 1;
    const _newNumDigitSize = (newNumSuffix + "").length;
    let padding = "";
    if (_newNumDigitSize < maxDigits) {
      padding = "0".repeat(maxDigits - _newNumDigitSize);
    }
    const newIndexName =
      indexName.replace(regex, "") + yearSuffix + padding + newNumSuffix;
    return newIndexName;
  } else {
    const newNumSuffix = "0".repeat(maxDigits - 1) + "1";
    const newIndexName =
      indexName + "_" + new Date().getFullYear() + "-" + newNumSuffix;
    return newIndexName;
  }
};

export const inferNewIndexMappings = (indexMappings) => {
  const newIndexMappings = {};
  for (const index in indexMappings) {
    const newIndexName = constructNewName(index);
    const mappings = indexMappings[index];
    newIndexMappings[newIndexName] = mappings;
  }
  return newIndexMappings;
};

/**
 *
 * @param {*} newIndexMappings
 * @returns {Promise<{index: string, isFulfilled: boolean}[]>}
 */
export const createIndices = async (newIndexMappings) => {
  try {
    const indicesArray = Object.keys(newIndexMappings);
    const promises = [];
    for (const index in newIndexMappings) {
      promises.push(
        client.indices.create({
          index: index,
          body: {
            ...newIndexMappings[index],
          },
        })
      );
    }
    const setteledPromises = await Promise.allSettled(promises);
    const fulfilledMask = setteledPromises.map((res, i) => ({
      index: indicesArray[i],
      isFulfilled: res.status === "fulfilled",
    }));
    return fulfilledMask;
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param {{index: string, alias: string}[]} indicesAliases
 * @param {{index: string, isFulfilled: boolean}[]} mask
 */
export const filterIndicesByMask = (indicesAliases, mask) => {
  return indicesAliases.filter(({ index }) => {
    const maskItem = mask.find((maskItem) => maskItem.index === index);
    return maskItem.isFulfilled;
  });
};

/**
 *
 * @param {{index: string, alias: string}[]} filteredIndices
 * @returns {Promise}
 */
export const enableWriteOnIndices = async (filteredIndices) => {
  try {
    const actions = filteredIndices.map(({ index, alias }) => ({
      add: {
        index,
        alias,
        is_write_index: true,
      },
    }));
    const res = await client.indices.updateAliases({
      body: {
        actions,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param {{index: string, alias: string}[]} filteredIndices
 * @returns {Promise}
 */
export const setIndicesAsReadOnly = async (filteredIndices) => {
  try {
    const actions = filteredIndices.map(({ index, alias }) => ({
      add: {
        index,
        alias,
        is_write_index: false,
      },
    }));
    const res = await client.indices.updateAliases({
      body: {
        actions,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
};
