/*

*/

const apiKey = getAPIKey();
if (!apiKey) {
  alert('Add a apiKey= parameter to the URL with the right key');
  // Finalize execution
  throw new Error("Stopping execution");  // Finalize execution
}


function getAPIKey() {
	const params = new URLSearchParams(window.location.search);
  const apiKey = params.get("apiKey");
	if (apiKey) {
		localStorage.setItem("apiKey", apiKey);
		return apiKey;
	}
	const apiKeylocalStorage = localStorage.getItem("apiKey");
	if (apiKeylocalStorage) {
		return apiKeylocalStorage;
	}
}

async function getTrackDownloadURL(searchQuery){ 
    // return "https://samplelib.com/lib/preview/mp3/sample-3s.mp3";   // REMOVE HARDCODED URL
    // Validate input
    if (typeof searchQuery !== "string" || searchQuery.trim() === "") {
        throw new Error("Invalid searchQuery: must be a non-empty string");
    }
    
    const searchResults = await searchTrack(searchQuery);
    if (searchResults === null || searchResults === undefined) {
      console.error("No searchResults");
      return null;
    }
    const videoId = await selectVideoId(searchResults);
    if (videoId === null || videoId === undefined) {
      console.error("No videoId found");
      return null;
    } 
    const downloadStreamData = await getDownloadStreamData(videoId);
    if (downloadStreamData === null || downloadStreamData === undefined) {
      console.error("No downloadStreamData found");
      return null;
    } 
    if ((downloadStreamData.hasOwnProperty('status')) && downloadStreamData.status.toLowerCase() !== "ok") {
      console.error("DownloadStreamData status is not ok");
      return null;
    } 
    if (!(downloadStreamData.hasOwnProperty('link')) || downloadStreamData.link.trim() === "") {
      console.error("DownloadStreamData has no link");
      return null;
    } 
    //const trackURL = await selectStreamURL(downloadStreamData)

    return downloadStreamData.link;
}

const searchAPIEndPoint = 'yt-api.p.rapi' + 'dapi.com'
const streamAPIEndPoint = 'youtube-mp36.p.rapi' + 'dapi.com'

async function searchTrack(searchQuery){
  // return sampleSearchResults;
  const url = `https://${searchAPIEndPoint}/search?query=${encodeURIComponent(searchQuery)}&type=video&duration=short`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': searchAPIEndPoint
    }
  };

  try {
      const response = await fetch(url, options);
      if (response.ok) {
          const responseData = await response.json(); // Parse the response as JSON
          return responseData;
      } else {
          console.log('Error exchanging code: ' + response.status + " " + response.statusText);
          return null;
      }

  } catch (error) {
      console.log('Error during the request: ' + error.message);
      return null;
  }

}

async function selectVideoId(searchResults){
  let videoId = null;
  if (!(searchResults.hasOwnProperty('data'))) {
    console.log("Returned video has no data field");
    return null;
  }
  for (const sr of searchResults.data) {
      if (sr.hasOwnProperty('type') && sr.type === "video" && sr.hasOwnProperty('videoId')) {
        videoId = sr.videoId;
        break; // Stops the loop
    }
  }
  return videoId;
}

async function getDownloadStreamData(videoId){
  const url = `https://${streamAPIEndPoint}/dl?id=${encodeURIComponent(videoId)}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': streamAPIEndPoint
    }
  };

  try {
      const response = await fetch(url, options);
      if (response.ok) {
          const responseData = await response.json(); // Parse the response as JSON
          return responseData;
      } else {
          console.log('Error exchanging code: ' + response.status + " " + response.statusText);
          return null;
      }

  } catch (error) {
      console.log('Error during the request: ' + error.message);
      return null;
  } 
}

async function getDownloadStreamDataYTAPI(videoId){
  // Using yt-api
  //return sampleDownloadStreamData;
  const url = `https://${searchAPIEndPoint}/dl?id=${encodeURIComponent(videoId)}&cgeo=ES`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': searchAPIEndPoint
    }
  };

  try {
      const response = await fetch(url, options);
      if (response.ok) {
          const responseData = await response.json(); // Parse the response as JSON
          return responseData;
      } else {
          console.log('Error exchanging code: ' + response.status + " " + response.statusText);
          return null;
      }

  } catch (error) {
      console.log('Error during the request: ' + error.message);
      return null;
  }  
}

async function selectStreamURLYTAPI(streamData){
  // parsing output of yt-api

  if (!(streamData.hasOwnProperty('adaptiveFormats'))) {
    console.log("Returned video has no data field");
    return null;
  }
  audioFormats = streamData.adaptiveFormats.filter(a => a.mimeType.includes("audio"));
  if (audioFormats.length != 0){
    maxBitRate = [getMax(audioFormats, "bitrate")];
    if (maxBitRate.length != 0){
      return maxBitRate[0]['url'];
    } else {
      return null;
    }
  }
}

// Function to convert size with units to bytes
const convertToBytes = (size) => {
  const units = {
    B: 1,
    KiB: 1024,
    MiB: 1024 ** 2,
    GiB: 1024 ** 3,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3
  };

  const regex = /([\d.]+)\s*([A-Za-z]+)$/;
  const match = size.match(regex);
  if (!match) {
      console.error(`Could not match from value : ${size}`)
      return 0;
  }
  const [_, value, unit] = match;
  return parseFloat(value) * (units[unit] || 1);
};

// Function to pause execution for the passed time span
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getMax(array, propName) {
  var max = 0;
  var maxItem = null;
  for(var i=0; i<array.length; i++) {
      var item = array[i];
      if(item[propName] > max) {
          max = item[propName];
          maxItem = item;
      }
  }

  return maxItem;
}

// Sample Data
