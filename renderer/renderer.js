
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const displayImg = document.getElementById('displayImg');
const outPutPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInp = document.querySelector('#height');
const widthInp = document.querySelector('#width');
let selectedFile = null;
// function loadImage(e){
//     const file = e.target.files[0];

//     if(!isFileImg(file)){
//         alertError('please select an image');
//         return;
//     }

//     //Get original dimensions
//     const image = new Image();
//     image.src = URL.createObjectURL(file);
//     image.onload = function(){
//         widthInp .value =this.width;
//         heightInp.value = this.height;
//     }

//     form.style.display="block";
//     filename.innerText = file.name;
//     outPutPath.innerText = path.join(os.homedir(), 'ImgResizer')

// }
function loadImage(e) {
    const file = e.target.files[0]; // store for later use
    selectedFile = file;
    if (!isFileImg(file)) {
        alertError('Please select an image');
        return;
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    displayImg.src = image.src; // Display the image in the img tag
    image.onload = function () {
        widthInp.value = this.width;
        heightInp.value = this.height;
    };

    form.style.display = 'block';
    filename.innerText = file.name;
    outPutPath.innerText = window.path.join(os.homedir(), 'ImgResizer');
}

//send image to main

async function sendImage(e){
    e.preventDefault();

    const width = widthInp.value;
    const height = heightInp.value;
    const file = img.files[0];
    
     if(!selectedFile){
        alertError('Please upload an image')
        return;
     }
     if(width ==='' || height===''){
        alertError('Please input a width and height')
        return;
     }

    //read file as an arraybuffer
    // const arrayBuffer = await selectedFile.arrayBuffer();
    // const buffer = window.Buffer.from(arrayBuffer);

    const imgPath = file.path;
    if(!imgPath){
        alertError('Unable to read file path');
        return;
    }

    
     //send to ipc renderer
     window.ipcRenderer.send('image:resize', {
        imgPath,
        width,
        height,
     })

}


//Catch the image:done event
ipcRenderer.on('image:done', ()=>{
    alertSuccess(`Image resized to ${widthInp.value} x ${heightInp.value}`)
})


//Check if the file is an image
function isFileImg(file){
    const acceptedImgTypes = ['image/gif', 'image/png', 'image/jpeg'];
    return file && acceptedImgTypes.includes(file['type'])
}

function alertError(message){
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style:{
            background: "red",
            color: "white",
            textAlign: "center",

        }

    })
}

function alertSuccess(message){
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style:{
            background: "green",
            color: "white",
            textAlign: "center",
            
        }

    })
}

img.addEventListener('change', loadImage)
form.addEventListener('submit', sendImage)