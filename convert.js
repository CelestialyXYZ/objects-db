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
        json.forEach((object) => {
          object.name = removeZeros(object.name);
          if (object.name.startsWith("NGC")) {
            object.ngc = object.name;
          } else if (object.name.startsWith("IC")) {
            object.ic = object.name;
          }
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
    logger.log("Error during task : ", e);
  }
})();
