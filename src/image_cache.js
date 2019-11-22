import Papa from 'papaparse';


export async function getImageCache(dataTransferItemList) {
  var cache = Object();
  cache['images'] = Object();

  let fileEntries = [];
  // Use BFS to traverse entire directory/file structure
  let queue = [];
  // Unfortunately dataTransferItemList is not iterable i.e. no forEach
  for (let i = 0; i < dataTransferItemList.length; i++) {
    console.log('queueing ' + dataTransferItemList[i].name + " " +  dataTransferItemList[i].type);
    queue.push(dataTransferItemList[i].webkitGetAsEntry());
  }

  var num_images = 0;
  while (queue.length > 0) {
    let entry = queue.shift();
    if (entry.isFile) {
      cache['images'][entry.fullPath.substring(1)] = entry;
      num_images = num_images + 1;
      console.log("cached", entry.fullPath.substring(1))
      fileEntries.push(entry);
    } else if (entry.isDirectory) {
      let reader = entry.createReader();
      queue.push(...await readAllDirectoryEntries(reader));
    }
  }

  cache['num_images'] = num_images;
  cache['load_table'] = async (file, success) => {
    await Papa.parse(file,
                     {header: true,
                      before: function(file, inputElem){ console.log('Attempting to Parse...', file)},
	              error: function(err, file, inputElem, reason){ console.log(err);},
	              complete: function(results, file){
                        cache['object_data'] = results.data;
                        cache['num_objects'] = cache['object_data'].length;
                        success(results);}
                     });
  };
    
  return cache;
}

// Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
async function readAllDirectoryEntries(directoryReader) {
  let entries = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
}

// Wrap readEntries in a promise to make working with readEntries easier
async function readEntriesPromise(directoryReader) {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.log(err);
  }
}

