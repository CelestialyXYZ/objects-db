const json2csv = require("json-2-csv");
const fs = require("fs");
const path = require("path");
const { Listr } = require("listr2");

const messier_locales = require("./open-ngc/messier_locales.json");

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
function raDecToFloat(raStr, decStr) {
  // Splitting RA and Dec strings into their components
  const raComponents = raStr.split(':');
  const decComponents = decStr.split(':');

  // Converting RA components to float
  const raHours = parseFloat(raComponents[0]);
  const raMinutes = parseFloat(raComponents[1]);
  const raSeconds = parseFloat(raComponents[2]);

  // Converting Dec components to float
  const decDegrees = parseFloat(decComponents[0]);
  const decMinutes = parseFloat(decComponents[1]);
  const decSeconds = parseFloat(decComponents[2]);

  // Converting RA and Dec to floating-point numbers
  const raFloat = raHours + raMinutes / 60 + raSeconds / 3600;
  const decFloat = decDegrees + decMinutes / 60 + decSeconds / 3600;

  return { ra: raFloat, dec: decFloat };
}

task = new Listr(
  [
    {
      title: "Coverting CSV title to lower case titles",
      task: () => {
        csv = csv.split("\n");
        csv[0] = csv[0].replaceAll(" ", "_").toLocaleLowerCase();
        csv[0] = csv[0].replace("name", "names");
        csv[0] = csv[0].replace("\r", "")
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
          const tempCatalog = object.names.replace(/[0-9]/g, "");
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
          object.names = removeZeros(object.names) + "";
          if (object.names.startsWith("NGC")) {
            if (object.ngc.length != 0) {
              object.ngc = object.ngc + "";
              object.ngc = [...object.ngc.split(",")];

              if (!object.ngc.includes(object.names)) {
                object.ngc.push(object.names);
              }
            } else {
              object.ngc = [object.names];
            }

            if (object.ic.length != 0) {
              object.ic = object.ic + "";
              object.ic = object.ic.split(",");
            } else {
              object.ic = [];
            }
          } else if (object.names.startsWith("IC")) {
            if (object.ic.length != 0) {
              object.ic = object.ic + "";
              object.ic = [...object.ic.split(",")];

              if (!object.ic.includes(object.names)) {
                object.ic.push(object.names);
              }
            } else {
              object.ic = [object.names];
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
      title: "Adding messier locales",
      task: () => {
        json.forEach((object) => {
          if(object.m.length != 0) {
            object.names = messier_locales.find((obj) => obj.messier == object.m[0]).names;
          } else {
            object.names = {
              en: null,
              fr: null
            };
          }
        });
      }
    },
    {
      title: "Removing \\r in sources",
      task: () => {
        json.forEach((object) => {
          object.sources = object.sources.replace("\r", "");
        })
      }
    },
    {
      title: "Splitting & repairing identifiers props",
      task: () => {
        json.forEach((object) => {
          object.identifiers = object.identifiers + ""
          if(object.identifiers.length != 0) {
            object.identifiers = object.identifiers.split(",");
            object.identifiers.forEach((obj, idx) => {
              object.identifiers[idx] = removeZeros(obj.toString()).replaceAll(" ", "");
            })
          } else {
            object.identifiers = [];
          }
        });
      }
    },
    {
      title: "Checking & moving common names",
      task: () => {
        json.forEach((object) => {
          object.common_names = object.common_names + ""
          if(object.common_names.length != 0) {
            object.names.extra = object.common_names.split(",");
          } else {
            object.names.extra = [];
          }
          delete object.common_names
        });
      }
    },
    {
      title: "Converting RA & DEC to float",
      task: () => {
        json.forEach((object) => {
          object.coords = raDecToFloat(object.ra, object.dec);
          delete object.dec;
          delete object.ra;
        });
      }
    },
    {
      title: "Saving file to out/data.json",
      task: () => {
        fs.writeFileSync(
          path.resolve("./out/data.json"),
          JSON.stringify(json, false, 2).replaceAll("\"\"", "null"),
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
