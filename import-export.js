const redcap = require("redcap");
const renameKeys = require("rename-keys");
const projectVariables = require("./project-variables");

const projectVariablesKeys = Object.keys(projectVariables);

const sourceToken = process.env.SOURCE_TOKEN;
const destToken = process.env.DEST_TOKEN;

const config = {
  host: "poa-redcap.med.yale.edu",
  path: "/api/",
};

const sourceParams = {
  content: "record",
  format: "json",
  type: "flat",
};

const destParams = {
  content: "record",
  format: "json",
  type: "flat",
  forceAutoNumber: false,
  overwriteBehavior: "normal",
  returnContent: "count",
  returnFormat: "json",
};

const sourceProject = redcap(sourceToken, config);
const destProject = redcap(destToken, config);

sourceProject.records.export(sourceParams, (err, records) => {
  if (err) {
    return console.error(err);
  }

  const newRecords = records.map((record) => {
    const newRecord = renameKeys(record, (key) => {
      if (projectVariablesKeys.includes(key)) {
        return projectVariables[key];
      }

      return key;
    });

    return newRecord;
  });

  destProject.records.importRecords(
    { data: newRecords, ...destParams },
    (err, res) => {
      if (err) {
        return console.error(err);
      }

      console.log(res);
    }
  );
});
