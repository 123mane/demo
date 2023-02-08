const xlsx = require('xlsx');

export function arrayToCSV(data) {
  let csv = data.map((row) => Object.values(row));
  csv.unshift(Object.keys(data[0]));
  return `"${csv.join('"\n"').replace(/,/g, '","')}"`;
}
export function convertCsvToArray(filePath: string) {
  try {
    const file = xlsx.readFile(filePath);
    let data = [];
    const sheets = file.SheetNames;
    for (let i = 0; i < sheets.length; i++) {
      const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[i]]);
      temp.forEach((res, i) => {
        if (res.attributes) {
          res['attributes'] = JSON.parse(res.attributes);
        }
        data.push(res);
      });
    }

    return data;
  } catch (error) {
    throw Error(error);
  }
}
