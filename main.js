const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img')
const {app, BrowserWindow, Menu, ipcMain, shell}= require('electron');

const isDev = process.env.NODE_ENV!=='production';
const isMac = process.platform ==='darwin';
let mainWindow;
//Creae the main window
function createMainWindow(){
     mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        height: 600,
        width: isDev? 1000: 500,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    //Open dev tools if in dev env
    if(isDev){
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

//Create About window
function createAboutWindow(){

    const aboutWindow = new BrowserWindow({
        title: 'About Image Resizer',
        height: 300,
        width: 300,
    });

    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'))

}


//App is ready
app.whenReady().then(()=>{
    createMainWindow();

    //Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', ()=>{
        if(BrowserWindow.getAllWindows().length===0){
            createMainWindow();
        }
    })

});

//Menu template
const menu =[
    ...(isMac
        ?[
            {
                label: app.name,
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    }
                ]
            }
        ]
        : []
    ),

    {
        role: 'fileMenu',
    },
    ...(!isMac
        ?[
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'About',
                        click: createAboutWindow,
                    }
                ]
            }
        ]
        :[]
    )

]

//Respond to ipc renderer

ipcMain.on('image:resize', (e, options)=>{
    options.dest = path.join(os.homedir(), 'ImgResizer')
    resizeImage(options);
});

//Resize the image
async function resizeImage({imgPath, width, height, dest}){
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        })
        //create filename
        // const filename = path.basename(imgPath);

        //create dest folder if it doesnt exist
        if(!fs.existsSync(dest)){
            fs.mkdirSync(dest);
        }
        const outputPath = path.join(dest, filename);


        //write file to dest
        fs.writeFileSync(outputPath, newPath) ;

        //send success to renderer
        mainWindow.webContents.send('image:done')

        //open dest folder
        shell.openPath(dest)

       } catch (error) {
        console.error(error)
        
    }


}

app.on('window-all-closed', ()=>{
    if(!isMac){
        app.quit()
    }
})
