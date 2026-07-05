console.log("Lets write JavaScript")


let currentSong = new Audio();

let songs;

let currFolder;

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/Assets/songs/${folder}/`)
    let response = await a.text();
    
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            
            songs.push(element.href.split(`${folder}%5C`)[1])
            

        }
    }
    //show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img class="invert" src="Assets/music.svg" alt="music">
            <div class="info">
            
            <div>${decodeURIComponent(song)}</div>
              
            </div>
            <div class="playnow flex">
              <span>Play Now</span>
              <img class="invert" src="Assets/play2.svg" alt="play">
            </div>
        </li>`;
    }
    


    //Attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    
    currentSong.src = `/Assets/songs/${currFolder}/` + track
    if (!pause) {

        currentSong.play()
        play.src = "Assets/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"



}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Assets/songs/`)
    let response = await a.text();
    
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("songs%5C")) {
            let folder = e.href.split("songs%5C").slice(-1)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/Assets/songs/${folder}/info.json`)
            let response = await a.json();
            
            folder = folder.split("/").filter(Boolean)[0];
            
            cardContainer.innerHTML = cardContainer.innerHTML + `<div 
            data-folder="${folder}" class="card">
            <img src="Assets/songs/${folder}/cover.jpg" alt="cover-photo">
            <span><img src="Assets/play.svg" alt="play"></span>
            <h2>${response.title}</h2>
            <div class="description">${response.description} </div>
          </div>`


        }
    }

    // load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            
            playMusic(songs[0])

        })
    })

}

async function main() {

    await getSongs("playlist")
    playMusic(songs[0], true)

    //Display all the albums on the page
    displayAlbums()


    //Attch an event listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play().catch(() => { })
            play.src = "Assets/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "Assets/play2.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML =
                `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }


    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        if (!isNaN(currentSong.duration)) {
            currentSong.currentTime = (currentSong.duration * percent) / 100
        }

        
    })

    //add an event listener for hamburger
    
    const hamburger = document.querySelector(".hamburger");
    const left = document.querySelector(".left");

    if (hamburger && left) {
        hamburger.addEventListener("click", () => {
            left.style.left = "0";
        });
    }


    //add  event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add an event listener to previous and next
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index - 1) >= 0) {

            playMusic(songs[index - 1])
        }
    })


    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next Clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index + 1) < songs.length) {

            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        

        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

        }
    })

}
main()