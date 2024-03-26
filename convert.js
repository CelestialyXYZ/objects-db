const json2csv = require("json-2-csv");
const fs = require("fs");
const path = require("path");
const { Listr } = require("listr2");

var csv = fs.readFileSync(path.resolve("./open-ngc/data.csv"), "utf-8");
var json;

var detectedCatalogs = [];

function removeZeros(str) {
  return str.replace(/([a-zA-Z]+\s?)0+/g, "$1");
}
function removeLeadingZeros(str) {
  // Use regex to find the first occurrence of a digit greater than 0
  const match = str.match(/[1-9]/);
  if (match) {
    // If a match is found, get the index of the match
    const index = match.index;
    // Remove leading zeros before the first non-zero digit
    return str.slice(index).replace(/^0+/, "");
  } else {
    // If no non-zero digit is found, return the input string
    return str;
  }
}
function firstCharNumber(inputString) {
  const firstChar = inputString.charAt(0);

  // Check if the first character is a number using isNaN() function
  return !isNaN(parseInt(firstChar));
}

task = new Listr(
  [
    {
      title: "Coverting CSV title to lower case titles",
      task: () => {
        csv = csv.split("\n");
        csv[0] = csv[0].replaceAll(" ", "_").toLocaleLowerCase();
        csv = csv.join("\n");
      },
    },
    {
      title: "Converting CSV to Json",
      task: () => {
        json = json2csv.csv2json(csv, {
          delimiter: {
            field: ";",
          },
        });
      },
    },
    {
      title: "Detecting catalogs",
      task: () => {
        json.forEach((object) => {
          const tempCatalog = object.name.replace(/[0-9]/g, "");
          if (!detectedCatalogs.includes(tempCatalog)) {
            detectedCatalogs.push(tempCatalog);
          }
        });
      },
    },
    {
      title: "Repairing catalog props",
      task: () => {
        json.forEach((object, idx) => {
          object.name = removeZeros(object.name) + "";
          if (object.name.startsWith("NGC")) {
            if (object.ngc.length != 0) {
              object.ngc = object.ngc + "";
              object.ngc = [...object.ngc.split(",")];

              if (!object.ngc.includes(object.name)) {
                object.ngc.push(object.name);
              }
            } else {
              object.ngc = [object.name];
            }

            if (object.ic.length != 0) {
              object.ic = object.ic + "";
              object.ic = object.ic.split(",");
            } else {
              object.ic = [];
            }
          } else if (object.name.startsWith("IC")) {
            if (object.ic.length != 0) {
              object.ic = object.ic + "";
              object.ic = [...object.ic.split(",")];

              if (!object.ic.includes(object.name)) {
                object.ic.push(object.name);
              }
            } else {
              object.ic = [object.name];
            }

            if (object.ngc.length != 0) {
              object.ngc = object.ngc + "";
              object.ngc = object.ngc.split(",");
            } else {
              object.ngc = [];
            }
          }
        });
      },
    },
    {
      title: "Repairing catalog props values format",
      task: () => {
        json.forEach((object, index) => {
          object.ngc.forEach((obj, idx) => {
            if (firstCharNumber(obj)) {
              object.ngc[idx] = "NGC" + obj;
            }
          });
          object.ic.forEach((obj, idx) => {
            if (firstCharNumber(obj)) {
              object.ic[idx] = "IC" + obj;
            }
          });

          if (object.m.length != 0) {
            object.m = object.m + "";
            object.m = object.m.split(",");
          } else {
            object.m = [];
          }

          object.m.forEach((obj, idx) => {
            object.m[idx] = removeLeadingZeros(obj.toString());
            object.m[idx] = "M" + object.m[idx];
          });
        });
      },
    },
    {
      title: "Saving file to out/data.json",
      task: () => {
        fs.writeFileSync(
          path.resolve("./out/data.json"),
          JSON.stringify(json, false, 2),
          "utf-8"
        );
      },
    },
  ],
  { concurrent: false }
);

(async () => {
  try {
    const startDate = new Date();
    const context = await task.run();
    const endDate = new Date();

    console.log("---- results ----");
    console.log(
      "⚡ Detected following catalogues : ",
      detectedCatalogs.join(", ")
    );
    console.log(`🎉 Done with success in ${(endDate - startDate) / 1000}s !`);
  } catch (e) {
    console.log("Error during task : ", e);
  }
})();
