import * as Carousel from "./Carousel.js";
import axios from "axios";


// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
//const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");


// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_qpcWOQBtvxeDe2PFxvWBf3wOmRGMtPEFIUmeprV7DP8RKIkE94GNBjfrCyyFf93o";

/**
* 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
*/
/**
* 4. Change all of your fetch() functions to axios!
* - axios has already been imported for you within index.js.
* - If you've done everything correctly up to this point, this should be simple.
* - If it is not simple, take a moment to re-evaluate your original code.
* - Hint: Axios has the ability to set default headers. Use this to your advantage
*   by setting a default header with your API key so that you do not have to
*   send it manually with all of your requests! You can also set a default base URL!
*/

async function initialLoad(){
  try {
    const response = await axios.get('https://api.thecatapi.com/v1/breeds');
    if(response.status !== 200) throw Error ('Breed not found')
    const breeds = response.data;
    const breedSelect = document.getElementById('breedSelect');
    
    breeds.forEach(breed => {
      const option = document.createElement('option');
      option.value = breed.id;
      option.text = breed.name;
      breedSelect.appendChild(option);
    })
    
    const getFavouritesBtn = document.getElementById("getFavouritesBtn");

    breedSelect.addEventListener('change', breedSelectorHandler , updateProgress );
    getFavouritesBtn.addEventListener('click', getFavourites)
    
  }
  catch(e){
    console.log(e)
  }
}

initialLoad();


async function breedSelectorHandler() {
Carousel.clear();
infoDump.innerHTML = ' ';


  const breedSelect = document.getElementById('breedSelect');
  const breedId = breedSelect.value;

  

  
const response = await axios.get(`https://api.thecatapi.com/v1/images/search?limit=5&breed_ids=${breedId}&api_key=${API_KEY}` , {
  onDownloadProgress: progressEvent => {

    const percentage = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
    console.log(percentage + "%")

    const progressBar = document.getElementById("progressBar");
    progressBar.style.width = percentage + "%";
    
  }

})
.then((jsonData) => {
    jsonData.data.forEach((catObj) =>{
        const imgUrl = catObj.url;
        const imgId = catObj.id; 
        const imgAlt = `cat image ${imgId}`
        const carouselElement = Carousel.createCarouselItem(imgUrl, imgAlt, imgId); 
        Carousel.appendCarousel(carouselElement); 
        Carousel.start();
    });


    //console.log(jsonData.data)

    const infoDump = document.getElementById("infoDump");
    const breedInfo = jsonData.data[0]

 
    const breedName = document.createElement('h2');
    breedName.textContent = breedInfo.breeds[0].name;
    

    const breedDescr = document.createElement('p');
    breedDescr.textContent = breedInfo.breeds[0].description


    const breedLife = document.createElement('p');
    breedLife.textContent = breedInfo.breeds[0].life_span


    const breedWiki = document.createElement('p');
    breedWiki.textContent = breedInfo.breeds[0].wikipedia_url

    infoDump.appendChild(breedName);
    infoDump.appendChild(breedDescr);
    infoDump.appendChild(breedLife);
    infoDump.appendChild(breedWiki);

    

}).catch(err => console.log(err));

  
}

/**
* 5. Add axios interceptors to log the time between request and response to the console.
* - Hint: you already have access to code that does this!
* - Add a console.log statement to indicate when requests begin.
* - As an added challenge, try to do this on your own without referencing the lesson material.
*/

axios.interceptors.request.use(request => {
  console.log("Request Sent")

  const progressBar = document.getElementById("progressBar");
  progressBar.style.width = "0%";

//body element cursor to progress
  document.body.cursor = "progress";
  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(
  (response) => {

    document.body.cursor = "default";
      response.config.metadata.endTime = new Date().getTime();
      response.config.metadata.durationInMS = response.config.metadata.endTime - response.config.metadata.startTime;

      console.log(`Request took ${response.config.metadata.durationInMS} milliseconds.`)
      return response;
  },
  (error) => {
      error.config.metadata.endTime = new Date().getTime();
      error.config.metadata.durationInMS = error.config.metadata.endTime - error.config.metadata.startTime;

      console.log(`Request took ${error.config.metadata.durationInMS} milliseconds.`)
      throw error;
});


/**
* 6. Next, we'll create a progress bar to indicate the request is in progress.
* - The progressBar element has already been created for you.
*  - You need only to modify its "width" style property to align with the request progress.
* - In your request interceptor, set the width of the progressBar element to 0%.
*  - This is to reset the progress with each request.
* - Research the axios onDownloadProgress config option.
* - Create a function "updateProgress" that receives a ProgressEvent object.
*  - Pass this function to the axios onDownloadProgress config option in your event handler.
* - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
*  - Update the progress of the request using the properties you are given.
* - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
*   once or twice per request to this API. This is still a concept worth familiarizing yourself
*   with for future projects.
*/
//

function updateProgress(){

  //const breedSelect = document.getElementById('breedSelect');
  const breedId = breedSelect.value;

  const options = {
    responseType : 'blob',
    onDownloadProgress: function(progressEvent){
      console.log(progressEvent)
    }
  }
  
axios.get(`https://api.thecatapi.com/v1/images/search?limit=5&breed_ids=${breedId}&api_key=${API_KEY}`, options).then(res=> console.log(res))


}

/**
* 7. As a final element of progress indication, add the following to your axios interceptors:
* - In your request interceptor, set the body element's cursor style to "progress."
* - In your response interceptor, remove the progress cursor style from the body element.
*/

//Done look at the request and response interceptor code 

/**
* 8. To practice posting data, we'll create a system to "favourite" certain images.
* - The skeleton of this function has already been created for you.
* - This function is used within Carousel.js to add the event listener as items are created.
*  - This is why we use the export keyword for this function.
* - Post to the cat API's favourites endpoint with the given ID.
* - The API documentation gives examples of this functionality using fetch(); use Axios!
* - Add additional logic to this function such that if the image is already favourited,
*   you delete that favourite using the API, giving this function "toggle" functionality.
* - You can call this function by clicking on the heart at the top right of any image.
*/
export async function favourite(imgId) {
 // your code here

 const postRequest = await axios.post(`https://api.thecatapi.com/v1/favourites?limit=20&image_id=${imgId}`, {image_id: imgId},{
  headers:{
    "Content-Type": "application/json",
    'x-api-key': 'live_qpcWOQBtvxeDe2PFxvWBf3wOmRGMtPEFIUmeprV7DP8RKIkE94GNBjfrCyyFf93o'
}
 })

 console.log(postRequest)

 const rawBody = JSON.stringify({
  "image_id": imgId,
 });

 const response = await axios.get(`https://api.thecatapi.com/v1/favourites?limit=20&image_id=${imgId}`,{
      method: 'Post',
      headers:{
          "Content-Type": "application/json",
          'x-api-key': 'live_qpcWOQBtvxeDe2PFxvWBf3wOmRGMtPEFIUmeprV7DP8RKIkE94GNBjfrCyyFf93o'
      },
      body: rawBody
  });

  console.log(response.data)
  return response.data;
}


/**
* 9. Test your favourite() function by creating a getFavourites() function.
* - Use Axios to get all of your favourites from the cat API.
* - Clear the carousel and display your favourites when the button is clicked.
*  - You will have to bind this event listener to getFavouritesBtn yourself.
*  - Hint: you already have all of the logic built for building a carousel.
*    If that isn't in its own function, maybe it should be so you don't have to
*    repeat yourself in this section.
*/

async function getFavourites(imgId){
  Carousel.clear();
  const response = await axios.get(`https://api.thecatapi.com/v1/favourites?limit=20&image_id=${imgId}`,{
    headers:{
      "Content-Type": "application/json",
      'x-api-key': 'live_qpcWOQBtvxeDe2PFxvWBf3wOmRGMtPEFIUmeprV7DP8RKIkE94GNBjfrCyyFf93o'
  }
  }
  .then((jsonData) => {
      jsonData.data.forEach((catObj) =>{
          const imgUrl = catObj.url;
          const imgId = catObj.id; 
          const imgAlt = `cat image ${imgId}`
          const carouselElement = Carousel.createCarouselItem(imgUrl, imgAlt, imgId); 
          Carousel.appendCarousel(carouselElement); 
          Carousel.start();
      });
  
  
      //console.log(jsonData.data)
  
      const infoDump = document.getElementById("infoDump");
      const breedInfo = jsonData.data[0]
  
   
      const breedName = document.createElement('h2');
      breedName.textContent = breedInfo.breeds[0].name;
      
  
      const breedDescr = document.createElement('p');
      breedDescr.textContent = breedInfo.breeds[0].description
  
  
      const breedLife = document.createElement('p');
      breedLife.textContent = breedInfo.breeds[0].life_span
  
  
      const breedWiki = document.createElement('p');
      breedWiki.textContent = breedInfo.breeds[0].wikipedia_url
  
      infoDump.appendChild(breedName);
      infoDump.appendChild(breedDescr);
      infoDump.appendChild(breedLife);
      infoDump.appendChild(breedWiki);
  
      
  
  }).catch(err => console.log(err)));
  
  
  const favourites = await response.json();
  console.log(favourites)

}
/**
* 10. Test your site, thoroughly!
* - What happens when you try to load the Malayan breed?
*  - If this is working, good job! If not, look for the reason why and fix it!
* - Test other breeds as well. Not every breed has the same data available, so
*   your code should account for this.
*/



