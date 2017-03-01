/**
 * Created by vsazel on 28.2.17.
 * Generation of randomized flow numbers array.
 */

/**
 * Function returns array with flow numbers generated with amount specified as percentages in <b>flowPercentages</b> of <b>totalCount</b>
 * @param {number} totalCount total count
 * @param {Array.<number>} flowPercentages array
 * @param {number=} randGen seed based random generator (LCG)
 */
'use strict';
function generateFlowArray(totalCount, flowPercentages, randGen) {
  if (!Array.isArray(flowPercentages)) {
    throw new TypeError('flowPercentages must be an array');
  }
  let retArray = [];
  for (let i = 0; i < flowPercentages.length; i++) {
    for (let j = 0; j < (Math.ceil((flowPercentages[i] / 100) * totalCount)); j++) {
      retArray.push(i);
    }
  }
  return shuffle(retArray, randGen);
}

/**
 * Function randomly shuffles array (<a href="https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle">Fisher–Yates_shuffle</a>)
 * @param {Array.<number>} arr array
 * @param {number=} randGen seed based random generator (LCG)
 */
function shuffle(arr, randGen) {
  let temp = null;
  let j = null;
  let i = arr.length;
  let rand = randGen;
  if (typeof rand === 'undefined') {
    rand = Math.random;
  }
  while (--i) {
    j = ~~(rand() * (i + 1));
    temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

module.exports = generateFlowArray;
