import { client } from "../elastic/client.js";

/**
 *
 * @param {string} indexPattern
 * @param {string} aliasPattern
 * @returns {Promise<{[indexName1]: { aliases: {[aliasName1]: {}}}, [indexName2]: {...}, ...}>}
 */
export const fetchAliasesByPattern = async (aliasPattern) => {
  const indices = await client.indices.getAlias({
    // index: "*",
    name: aliasPattern,
  });
  return indices.body;
};

/**
 *
 * @param {{[indexName1]: { aliases: {[aliasName1]: {}}}, [indexName2]: {...}, ...}} indices result of fetchAliasesByPattern()
 * @returns {{index: string, alias: string}[]}
 */
export const findAllWriteIndexNames = (indices) => {
  const aliasWriteIndices = [];
  for (const index in indices) {
    for (const aliasName in indices[index].aliases) {
      if (
        "is_write_index" in indices[index].aliases[aliasName] &&
        indices[index].aliases[aliasName].is_write_index
      ) {
        aliasWriteIndices.push({
          index,
          alias: aliasName,
        });
        break;
      }
    }
  }
  return aliasWriteIndices;
};

/**
 *
 * @param {string[]} indexNames
 * @returns {Promise<{index: string, byteSize: number, docCount: number}[]>}
 */
export const fetchIndexStats = async (indexNames) => {
  if (indexNames.length) {
    const statsPerIndex = [];
    const { body } = await client.indices.stats({ index: indexNames });
    for (const index in body.indices) {
      statsPerIndex.push({
        index,
        byteSize: body.indices[index].total.store.size_in_bytes,
        docCount: body.indices[index].total.docs.count,
      });
    }
    return statsPerIndex;
  }
  return [];
};

/**
 *
 * @param {{index: string, byteSize: number, docCount: number}} indexStat
 * @param {{max_size: number, max_docs: number}} condition
 * @returns {boolean}
 */
export const shouldRollover = (indexStat, condition) => {
  return (
    indexStat.byteSize > condition.max_size ||
    indexStat.docCount > condition.max_docs
  );
};

/**
 *
 * @param {{index: string, alias: string}[]} indicesAliases
 * @param {{index: string, byteSize: number, docCount: number}[]} indicesStats
 * @returns {{index: string, alias: string}[]}
 */
export const filterRolloverIndices = (
  indicesAliases,
  indicesStats,
  condition
) => {
  return indicesAliases.filter(({ index }) => {
    const stat = indicesStats.find((stat) => stat.index === index);
    return shouldRollover(stat, condition);
  });
};

/**
 *
 * @param {string[]} indexNames
 * @returns {Promise}
 */
export const fetchIndexMappings = async (indexNames) => {
  if (indexNames.length) {
    const res = await client.indices.getMapping({
      index: indexNames,
    });
    if (res) return res.body;
  }
  return {};
};
