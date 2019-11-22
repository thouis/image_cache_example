import React from 'react';
import './App.css';
import { getImageCache } from './image_cache';

async function dropImagesHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  var elItems = document.getElementById('image_items');
  window.image_cache = await getImageCache(ev.dataTransfer.items);
  var num_images = window.image_cache.num_images;
  elItems.innerHTML = `Loaded ${num_images} images into cache.`
  document.getElementById("button").disabled = false;
}

async function dropTableHandler(ev) {
  ev.stopPropagation();
  ev.preventDefault();
  var files = ev.dataTransfer.files;
  var elItems = document.getElementById('object_items');

  if ('image_cache' in window) {
    window.image_cache.load_table(files[0],
                                  function () {
                                    var num_objects = window.image_cache.num_objects;
                                    elItems.innerHTML = `Loaded ${num_objects} objects into cache.`;
                                  });
  } else {
    elItems.innerHTML = `Load images first.`
  }
}


function dragOverHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

function loadImage(ev) {
  if (('image_cache' in window) && ('object_data' in window.image_cache)) {
    var el = (ev.target || ev.srcElement);

    // get a random object
    var randidx = Math.floor(Math.random() * (window.image_cache.num_objects));
    var object_info = window.image_cache.object_data[randidx];
    if (("Channel DNA" in object_info) && (object_info["Channel DNA"] !== "")) {
      var rand_image = window.image_cache.images[object_info["Channel DNA"]];

      var canvas = document.getElementById('canvas');
      var context = canvas.getContext("2d"); 
      var img = new Image();
      var reader = new FileReader();
      // Read in the image file as a data URL.
      rand_image.file(function(file) {
        reader.readAsDataURL(file);
        reader.onload = function(evt) {
          if( evt.target.readyState === FileReader.DONE) {
	    img.src = evt.target.result;
            img.onload = () => context.drawImage(img,
                                                 // source x, y, width, height
                                                 object_info["Object X"] - 25, object_info["Object Y"] - 25, 50, 50,
                                                 // dest x, y, width, height
                                                 0, 0, 100, 100);
            console.log('loaded image');
          }
        }});
      
      window.rand_image = rand_image;
      window.clicked_el = el;
    }
  }
}

function App() {
  return (
      <div className="App">

      <header className="App-header">
      <p>Drag imagedir here ...</p>

      <div id="drop_zone" onDrop={dropImagesHandler} onDragOver={dragOverHandler}>
      <ul id="image_items"></ul>
      </div>

      <p>Drag table here ...</p>
      <div id="drop_zone" onDrop={dropTableHandler} onDragOver={dragOverHandler}>      
      <ul id="object_items"></ul>
      </div>


      <canvas id="canvas"></canvas>
      <input id="button" type="button" value="click here" onClick={loadImage}></input>
      </header>

    </div>
  );
}


export default App;
