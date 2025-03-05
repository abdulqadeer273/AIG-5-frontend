// shuffles a given array
export function shuffle(arr) {
    const array = arr.slice();
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }
  
  // generates all possible combinations of multiple arrays
  export function generate(obj) {
    let output = [];
    // initialize with first element's index
    const all_keys = Object.keys(obj);
    const len = all_keys.length;
    const indices = {};
    all_keys.forEach((key) => {
      indices[key] = 0;
    });
  
    while (1) {
      //  push current combination
      let temp = {};
      all_keys.forEach((key) => {
        temp[key] = obj[key][indices[key]];
      });
      output.push(temp);
  
      // find the rightmost array that has more
      // elements left after the current element in that array
      let next = len - 1;
      while (
        next >= 0 &&
        indices[all_keys[next]] + 1 >= obj[all_keys[next]].length
      )
        next--;
  
      // no such array is found so no more combinations left
      if (next < 0) break;
  
      // if found move to next element in that array
      indices[all_keys[next]]++;
  
      // for all arrays to the right of this
      // array current index again points to first element
      for (let i = next + 1; i < len; i++) indices[all_keys[i]] = 0;
    }
  
    return output;
  }
  
  // returns a dynamic regex
  export function getReplaceRegex(field) {
    return new RegExp("\\(" + field + "\\)", "gi");
  }
  
  // removes element at specific index from a given array
  export function removeElAtIndex(arr, index) {
    return arr.slice(0, index).concat(arr.slice(index + 1));
  }
  
  export function removeOptionElAtIndex(arr, category) {
    // console.log("arr : ", arr);
    delete arr[category];
    // console.log("arr : ", arr);
    return arr;
  }
  
  // generates tex document code
  export function generateLatex({ fields, story, question, data, answersData, MCQs }) {
    let txtfile = ""
  
    story.map((ss, storyIndex) => question.map((questionEl, questionIndex) => {
      const newData = {};
      var storyTags = ss
        .trim()
        .match(/\([a-z0-9_-]+\)/gi);
      storyTags?.map((el) => el.slice(1, el.length - 1))
        .forEach((el) => {
          newData[el] = fields[el] || [];
        });
      const mydata = generate(newData).map(
        (el, index) => ({
          ...el,
          id: index,
        })
      );
  
  
      // console.log("My data", mydata);
      MCQs.map((dataEl, dataIndex) => {
        var bb = ss;
        var filedsArr = Object.keys(fields);
        filedsArr.forEach((field) => {
          bb = bb.replace(
            getReplaceRegex(field),
            `${dataEl[field]}`
          );
        });
        txtfile = txtfile + `${bb}\n`;
        txtfile = txtfile + `${questionEl}\n`;
        answersData[dataIndex].map((el, MCQIndex) => {
          txtfile = txtfile + `${String.fromCharCode("a".charCodeAt(0) + MCQIndex)}. ${el}\n`;
        });
        txtfile = txtfile + `\n\n`;
  
        // console.log("txtfile iterate", txtfile);
      });
    }))
    // console.log("txtfile", txtfile);
    return txtfile;
  }
  
  
  
  
  // triggers downloading of a file
  export function downloadFile(str) {
    const hiddenElement = document.createElement("a");
    hiddenElement.href = "data:text/plain;charset=utf-8," + encodeURI(str);
    hiddenElement.target = "_blank";
    hiddenElement.download = `questions.txt`;
    hiddenElement.click();
  }
  