// function allPossibleVariablesCases(arr) {
//     console.log("first")
//     if (arr.length == 1) {
//       return arr[0];
//     } else {
//       var result = [];
//       var allCasesOfRest = allPossibleVariablesCases(arr.slice(1)); // recur with the rest of array
//       // console.log("In Recursion", allCasesOfRest)
//       for (var i = 0; i < allCasesOfRest.length; i++) {
//         for (var j = 0; j < arr[0].length; j++) {
//           result.push(arr[0][j] + "," + allCasesOfRest[i]);
//         }
//       }
//       result = result.filter(elem => !elem.includes("both"))
//       return result;
//     }
//   }
//   function getNumberOfCombinations() {
//     const variablesArray = [];
//     for (let i = 0; i < Object.keys(fields).length; i++) {
//         variablesArray.push(variables[Object.keys(fields)[i]]);
//     }
//     let allVaraiblesCases = allPossibleVariablesCases(variablesArray);
//     console.log(allVaraiblesCases, 'allVaraiblesCases')
//     return allVaraiblesCases.length
//   }

// function areBothArraysEqual(firstArray, secondArray) {
//     if (!Array.isArray(firstArray) || !Array.isArray(secondArray) ||
//       firstArray.length !== secondArray.length)
//       return false;
//     var tempFirstArray = firstArray.concat().sort();
//     var tempSecondArray = secondArray.concat().sort();
//     for (var i = 0; i < tempFirstArray.length; i++) {
//       if (tempFirstArray[i] !== tempSecondArray[i])
//         return false;
//     }
//     return true;
//   }
//   const equalsCheck = (a, b) => {
//     return JSON.stringify(a) === JSON.stringify(b);
//   }
//   useEffect(() => {
//     if (noOfMcqs) {
//       let mainArr = [];
//       for (let i = 0; i < noOfMcqs; i++) {
//         let subArr = [];
//         for (let j = 0; j < Object.keys(fields)?.length; j++) {
//           var randomIndex = Math.floor(Math.random() * variables[Object.keys(fields)[j]]?.length);
//           let variable = variables[Object.keys(fields)[j]][randomIndex]
//           subArr.push({ [Object.keys(fields)[j]]: variable })
//         }
//         // let result = mainArr?.every(el => areBothArraysEqual(el, subArr))
//         // console.log(i, result, 'ki bnaya')
//         mainArr.push(subArr)
//       }
//       console.log(mainArr, "array made")
//     }
//   }, [noOfMcqs])