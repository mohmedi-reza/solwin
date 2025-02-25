export function CoinToss(probability: number){

    if(probability < 0 || probability > 100){
        throw "probability should be between 0 and 100"
    }

    const randomInt = Math.floor(Math.random() * 100);

    if(probability > randomInt){
        return true;
    } else {
        return false;
    }
}


export function CoinTossStyleFilterArrays(array1: any, array2: any, probability: number) {
  if (array1.length !== array2.length) {
    throw new Error('Arrays must have the same length');
  }

  const filteredArray1 = [];
  const filteredArray2 = [];
  const filteredArray3 = [];

  // OPTION 1
  // normal probabilistic
  /* 
  for (let i = 0; i < array1.length; i++) {
    if (CoinToss(probability)) {
      filteredArray1.push(array1[i]);
      filteredArray2.push(array2[i]);
      filteredArray3.push(i)
    }
  }
  */


  // OPTION 2
  // ensure to always get 2
  const [first, second] = getRandomUniqueNumbers(array1.length);

  filteredArray1.push(array1[first])
  filteredArray1.push(array1[second])

  filteredArray2.push(array2[first])
  filteredArray2.push(array2[second])

  filteredArray3.push(first)
  filteredArray3.push(second)



  return [filteredArray1, filteredArray2, filteredArray3];
}


export function IndexStyleFilterArrays(array1: any, array2: any, indexes: number[]) {
  if (array1.length !== array2.length) {
    throw new Error('Arrays must have the same length');
  }

  const filteredArray1 = [];
  const filteredArray2 = [];
  const filteredArray3 = [];

  for (let i = 0; i < array1.length; i++) {
    if (indexes.includes(i)) {
      filteredArray1.push(array1[i]);
      filteredArray2.push(array2[i]);
      filteredArray3.push(i)
    }
  }

  return [filteredArray1, filteredArray2, filteredArray3];
}


export function getRandomIndexByWeight(weights: number[]): number {
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  const weightedRanges = weights.map((weight) => weight / totalWeight);

  // Generate a random number between 0 and 1
  let random = Math.random();

  for (let i = 0; i < weightedRanges.length; i++) {
    random -= weightedRanges[i];
    if (random < 0) {
      // Add 1 because the question asks for indexes 1 to length of the array
      return i + 1;
    }
  }

  // Should never get here if weights are positive and totalWeight > 0
  throw new Error('Invalid weights: ' + weights);
}


export function GetRandomInRangeRoundedToNearest100(rangeLow: number, rangeHigh: number){
    if(rangeLow == rangeHigh){ return rangeHigh}
    const AdditionToMin = (Math.floor(Math.random() * (rangeHigh - rangeLow)));
    const AdditionToMinRounded = Math.floor((AdditionToMin + 50) / 100) * 100; // round to nearest 100
    return AdditionToMinRounded + rangeLow;
}


export function GetRandomInRangeRoundedToNearest1(rangeLow: number, rangeHigh: number){
    if(rangeLow == rangeHigh){ return rangeHigh}
    const AdditionToMin = (Math.floor(Math.random() * (rangeHigh - rangeLow)));
    const AdditionToMinRounded = Math.floor(AdditionToMin + 0.5); // round to nearest 1
    return AdditionToMinRounded + rangeLow;
}


export function GetRandomInRangeRoundedTo2Decimals(rangeLow: number, rangeHigh: number){
  if(rangeLow == rangeHigh){ return rangeHigh}
    const AdditionToMin = (Math.floor(Math.random() * (rangeHigh - rangeLow) * 100));
    const AdditionToMinRounded = Math.floor(AdditionToMin + 50) / 100; // round to nearest 1
    return AdditionToMinRounded + rangeLow;
}


export const RoundTo8Decimals = (number: number) => {
  const factor = 10 ** 8; // 10 raised to the power of 8
  return Math.round(number * factor) / factor;
};

// inclusive of min and max
function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomUniqueNumbers(size: number) {
  const firstNumber = getRandomNumber(0, size - 1);
  let secondNumber;
  
  do {
    secondNumber = getRandomNumber(0, size - 1);
  } while (secondNumber === firstNumber);

  // order them
  if(firstNumber > secondNumber){
    return [secondNumber, firstNumber];
  }

  return [firstNumber, secondNumber];
}


export function arrayDifference<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(item => !arr2.includes(item));
}

export function generateIntegerArray(n: number): number[] {
  return Array.from({ length: n }, (_, index) => index);
} 

