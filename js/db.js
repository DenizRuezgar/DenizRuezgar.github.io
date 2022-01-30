// https://www.youtube.com/watch?v=vK2NoOoqyRo
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {
  getFirestore, collection, getDocs,
  addDoc, deleteDoc, doc, GeoPoint
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js';

import {
  getStorage, ref, getDownloadURL, uploadString
} from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js';

const firebaseConfig = {
  apiKey: "AIzaSyDvCH2ZUreUkYasJU3g7ykiVbGtOHArJ-A",
  authDomain: "testpwa-336611.firebaseapp.com",
  projectId: "testpwa-336611",
  storageBucket: "testpwa-336611.appspot.com",
  messagingSenderId: "692584001354",
  appId: "1:692584001354:web:50fabc2c2af19e141c9bb3"
};


//init app
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const db = getFirestore()

const colRef = collection(db, 'Photos')

let position

const addPhotoForm = document.querySelector('.add')
if (addPhotoForm) {

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const snap = document.getElementById("snap");
  const errorMsgElement = document.querySelector('span#errorMsg');
  const submitbtn = document.getElementById('submitbtn');
  const input = document.getElementById('input');

  const constraints = {
    audio: false,
    video: {
      width: 400, height: 400
    }
  };

  // Access webcam
  async function init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      handleSuccess(stream);
    } catch (e) {
      errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
    }
  }

  // Success
  function handleSuccess(stream) {
    window.stream = stream;
    video.srcObject = stream;
  }

  // Load init
  init();
  
  // Draw image
  var image = new Image();
  var context = canvas.getContext('2d');
  snap.addEventListener("click", function () {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    image.id = "pic";
    image.src = canvas.toDataURL();

    setTimeout(function(){ 
      console.log("Ready")
  }, 10000);
  var fileName = new Date() + '-' + 'base64';
  const storageRef = ref(storage, fileName);
  const upload =  uploadString(storageRef, image.src, "data_url").then((snapshot) => {
     getDownloadURL(snapshot.ref).then((downloadurl) => {
      addPhotoForm.url.value = downloadurl.toString();
     console.log("image submitted");
     console.log(addPhotoForm.url.value);
    })
  });
  });


  submitbtn.addEventListener('click', (e) => {

    

    e.preventDefault()

    if (!addPhotoForm.url.value) {
      e.preventDefault()
      alert('take a picture first before submitting a form')
      return false
    }
    else if(!addPhotoForm.name.value){
      e.preventDefault()
      alert('Provide a name before submitting a form')
      return false
    }

    const currentPosition = document.getElementById('currentpos');
    const latitude_form = document.getElementById('lat');
    const longnitude_form = document.getElementById("lng");
    const status = document.getElementById('privatespot');
    var value = null;
    var start = new Date();
    
    
    if(status.checked)
      {
        value = true;
        console.log("true");
      }else
      {
        value = false;
        console.log("false");
      }


    if (currentPosition.checked) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          position = new GeoPoint(pos.coords.latitude, pos.coords.longitude);
          addDoc(colRef, {
            check: value,
            date: start.toLocaleDateString() +" " +start.toLocaleTimeString(),
            name: addPhotoForm.name.value,
            position: position,
            url: addPhotoForm.url.value,
          }).then(() => {
            alert("form submitted succesfully")
            addPhotoForm.reset()
            context.clearRect(0, 0, canvas.width, canvas.height);
            window.location.href="/index.html";
          })

        },
          function (error) {
            if (error.code == error.PERMISSION_DENIED) {
              alert("User denied the request for Geolocation.")
            }
          }

        )
      } else {
        alert("Geolocation not supported")
      }

    }
    else if (addPhotoForm.latitude.value == "" || addPhotoForm.longnitude.value == "") {
      alert('please provide values for latitude and longnitude')
    }
    else {
      if (addPhotoForm.latitude.value > 90 || addPhotoForm.latitude.value < -90) {
        alert("Latitude must be a number between -90 and 90 but was: " + addPhotoForm.latitude.value)
      }
      if (addPhotoForm.longnitude.value > 180 || addPhotoForm.latitude.value < -180) {
        alert("Longnitude must be a number between -90 and 90 but was: " + addPhotoForm.longnitude.value)
      }
      addDoc(colRef, {
        check: value,
        date: start.toLocaleDateString() +" " +start.toLocaleTimeString(),
        name: addPhotoForm.name.value,
        position: new GeoPoint(addPhotoForm.latitude.value, addPhotoForm.longnitude.value),
        url: addPhotoForm.url.value

      }).then(() => {
        addPhotoForm.reset();
        console.log('success')
        alert('form submitted successfully')
      })
    }

  })
}


//delete documents
const deletePhotoForm = document.querySelector('.delete')
if (deletePhotoForm) {
  deletePhotoForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const docRef = doc(db, 'Photos', deletePhotoForm.id.value)

    deleteDoc(docRef)
      .then(() => {
        deletePhotoForm.reset()
      })
  })
}



// console.log(image.src)
// var button = document.createElement('button')
// button.textContent = 'Upload Image'
// document.body.appendChild(button)

// button.addEventListener('click', () => {
  // this.setAttribute('display', 'none')
  
// })

