function resetScroll() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function scrollProgress() {
  let maximum = document.documentElement.scrollHeight - window.innerHeight;
  let progress = 0;
  if (maximum > 0) { progress = window.scrollY / maximum; }
  if (progress < 0) { progress = 0; }
  if (progress > 1) { progress = 1; }
  return progress;
}

function playAudio(player) {
  audio.pause();
  audio = player;
  audio.currentTime = 0;
  trackFill.style.width = "0%";
  audio.play();
}

function resizeScenes() {
  let height = window.innerHeight - 145;
  if (height < 100) { height = 100; }
  let panels = ["outside-viewport", "bus-interior", "home-street", "elevator-lobby"];
  for (let i = 0; i < panels.length; i++) {
    document.getElementById(panels[i]).style.height = height + "px";
  }
  let size = 1200;
  if (window.innerWidth * 1.2 < size) { size = window.innerWidth * 1.2; }
  if (window.innerHeight * 1.18 < size) { size = window.innerHeight * 1.18; }
  let stage = document.getElementById("headphones-stage");
  stage.style.width = size + "px";
  stage.style.height = size + "px";
  stage.style.marginLeft = (-size / 2) + "px";
  stage.style.marginTop = (-size / 2) + "px";
}

let pedestrianStarts = [390.0, 360.0, 240.0, 200.0, 290.0, 420.0, 140.0, 125.0];
let pedestrianTravel = [-30.0, -45.0, 35.0, 30.0, -20.0, -35.0, 20.0, 25.0];
let companionStarts = [310.0, 530.0, 1600.0];
let companionRates = [1.08, 1.0, -0.32];
let walkerStarts = [620.0, 678.0, 850.0, 908.0, 1460.0, 1518.0, 1576.0, 1840.0, 1898.0];
let walkerSpeeds = [0.03, -0.025, 0.02, -0.02, 0.03, -0.025, 0.02, -0.02, 0.03];

let masterVolume = 0.7;
document.getElementById("volume-up").addEventListener("click", volumeUp);
document.getElementById("volume-down").addEventListener("click", volumeDown);

function volumeUp() {
  masterVolume += 0.1;
  if (masterVolume > 1) { masterVolume = 1; }
  applyMasterVolume();
}

function volumeDown() {
  masterVolume -= 0.1;
  if (masterVolume < 0) { masterVolume = 0; }
  applyMasterVolume();
}

function applyMasterVolume() {
  document.getElementById("volume-value").innerHTML = Math.floor(masterVolume * 100 + 0.5) + "%";
  let media = document.getElementsByClassName("story-media");
  for (let i = 0; i < media.length; i++) {
    media[i].volume = masterVolume;
  }
  document.getElementById("volume-up").disabled = masterVolume >= 0.999;
  document.getElementById("volume-down").disabled = masterVolume <= 0.001;
}
applyMasterVolume();

let introScreen = document.getElementById("intro-screen");
let journeyStarted = false;
resetScroll();
introScreen.addEventListener("click", beginJourney);

function beginJourney() {
  journeyStarted = true;
  prepareMedia();
  document.getElementById("volume-control").style.display = "block";
  introScreen.style.display = "none";
  document.body.className = "";
  resetScroll();
  movePerson();
}

let person = document.getElementById("person");
let caption = document.getElementById("caption");
let classmates = document.getElementsByClassName("classmate");
let startingPositions = [25, 29, 36, 39, 43, 65, 69, 77, 81, 88];
let walkingSpeeds = [20, 20, 20, -18, -18, -22, -22, 24, 24, 24];

let outsideStarted = false;
let arrivedAtBusStop = false;
let busArrivalStarted = false;
let onBus = false;
let seated = false;
let wearingHeadphones = false;
document.getElementById("interior-person").addEventListener("click", putOnHeadphones);

let returningToBus = false;
let announcementFinished = false;
let hasSteppedOff = false;

function putOnHeadphones() {
  if (!seated || wearingHeadphones) { return; }
  wearingHeadphones = true;
  audio.pause();

  document.getElementById("bus-interior").style.display = "none";
  document.getElementById("headphones-scene").style.display = "block";
  document.getElementById("interior-caption").innerHTML = "Just me and the music.";
  document.body.className = "headphones-open";
  resetScroll();
  let video = document.getElementById("headphones-video");
  video.currentTime = 0;
  video.muted = false;
  audio = video;

  trackFill.style.width = "0%";
  audio.play();
}

function stopHeadphoneVideoAt19() {
  if (wearingHeadphones && audio.currentTime >= 19) {
    returnToBus();
  }
}

let announcementPlayer = document.getElementById("announcement-audio");

function returnToBus() {
  if (returningToBus) { return; }
  returningToBus = true;

  wearingHeadphones = false;
  seated = false;
  document.getElementById("headphones-scene").style.display = "none";
  document.getElementById("bus-interior").style.display = "block";
  document.body.className = "on-bus";
  document.getElementById("interior-caption").innerHTML = "That’s my stop! Scroll down to the door and get off.";
  let person = document.getElementById("interior-person");
  person.className = "";

  person.style.left = "50%";
  person.style.top = "120px";

  document.getElementById("exit-bus-door").style.display = "block";
  resetScroll();
  playAudio(announcementPlayer);

  movePerson();
}

function finishAnnouncement() {
  announcementFinished = true;
  movePerson();
}

function stepOffBus() {
  if (hasSteppedOff) { return; }
  hasSteppedOff = true;
  audio.pause();

  document.getElementById("bus-interior").style.display = "none";
  beginFinalJourney();
}

let cardFinished = false;
let seatRequested = false;
document.getElementById("corner-seat").addEventListener("click", requestSeat);

function requestSeat() {
  if (!onBus || seated) { return; }
  seatRequested = true;
  if (cardFinished) { sitDown(); }
}

let seatedCrowdPlayer = document.getElementById("seated-crowd-audio");

function sitDown() {
  if (seated) { return; }
  seated = true;
  let person = document.getElementById("interior-person");
  person.style.left = "69%";
  person.style.top = "445px";

  person.className = "headphones-ready";

  document.getElementById("corner-seat").style.outline = "none";
  document.getElementById("interior-caption").innerHTML = "Why is it so noisy? Let’s listen to some music. Click me to put on my headphones.";
  playAudio(seatedCrowdPlayer);

}

function fillBus() {
  if (!seated) { return; }
  let passengers = document.getElementsByClassName("bus-passenger");
  for (let i = 0; i < passengers.length; i++) {
    if (audio.currentTime >= i * 0.45) {
      passengers[i].style.display = "block";
    }
  }
}

function finishCard() {
  if (onBus && !seated) {
    cardFinished = true;
    if (seatRequested) { sitDown(); }
  }
}
let boardingReady = false;
document.getElementById("arriving-bus").addEventListener("click", boardBus);

let busInteriorPlayer = document.getElementById("bus-interior-audio");

function boardBus() {
  if (!boardingReady || onBus) { return; }
  onBus = true;

  document.getElementById("outside-viewport").style.display = "none";
  document.getElementById("outside-caption").style.display = "none";
  document.getElementById("bus-interior").style.display = "block";
  document.getElementById("interior-caption").style.display = "block";
  document.body.className = "on-bus";
  resetScroll();
  playAudio(busInteriorPlayer);

  movePerson();
}
let busArrivalPlayer = document.getElementById("bus-arrival-audio");

function startBusArrival() {

  playAudio(busArrivalPlayer);

  document.getElementById("arriving-bus").style.display = "block";

}

function moveBus() {
  let progress = (audio.currentTime - 0.8) / 7.9;
  if (progress < 0) { progress = 0; }
  if (progress > 1) { progress = 1; }
  document.getElementById("arriving-bus").style.left = (-50 + progress * 101) + "%";
  if (audio.currentTime >= 8.7) {
    boardingReady = true;
    document.getElementById("outside-caption").innerHTML = "Let’s get on! Click the bus to board.";
  }
}
let audio = document.getElementById("indoor-audio");
let scene = document.getElementById("scene");
scene.addEventListener("click", leaveSchool);

let outdoorAudio = document.getElementById("outside-audio");

function leaveSchool() {
  if (!journeyStarted || outsideStarted) {
    return;
  }
  let maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0 || window.scrollY < maxScroll - 2) {
    return;
  }
  outsideStarted = true;
  audio.pause();
  audio = outdoorAudio;

  document.body.appendChild(soundPlayer);
  scene.style.display = "none";
  document.getElementById("outside-viewport").style.display = "block";
  document.getElementById("outside-scene").style.display = "block";
  document.getElementById("outside-caption").style.display = "block";
  document.body.className = "outside-open";
  soundPlayer.style.display = "block";
  trackFill.style.width = "0%";
  resetScroll();
  movePerson();
  audio.currentTime = 0;
  audio.play();
}
let startButton = document.getElementById("start-sound");
let soundPlayer = document.getElementById("sound-player");
let trackFill = document.getElementById("track-fill");

startButton.addEventListener("click", startSound);

window.addEventListener("scroll", movePerson);
window.addEventListener("resize", resizeScenes);
window.addEventListener("resize", movePerson);

function showPause() {
  startButton.innerHTML = "❚❚";

}

function showPlay() {
  startButton.innerHTML = "▶";

}

function updatePlayer() {
  if (audio.duration > 0) {
    trackFill.style.width = (audio.currentTime / audio.duration * 100) + "%";
  }
}

function startSound() {
  if (finalPhase === "waiting" || finalPhase === "elevator-ready" || finalPhase === "end") { return; }
  if (!outsideStarted && scrollProgress() >= 0.8) { return; }
  if (audio.paused) {
    if (audio.ended || (outsideStarted && arrivedAtBusStop && !onBus)) { audio.currentTime = 0; }
    audio.play();
  } else {
    audio.pause();
  }
}

let finalPhase = "";
let finalWalkProgress = 0;
let entrySoundFinished = false;
let finalPlayers = [];
finalPlayers[0] = document.getElementById("final-audio-0");
finalPlayers[1] = document.getElementById("final-audio-1");
finalPlayers[2] = document.getElementById("final-audio-2");
finalPlayers[3] = document.getElementById("final-audio-3");

document.getElementById("lobby-person").addEventListener("click", wearHeadphonesAgain);

finalPlayers[4] = document.getElementById("final-audio-5");

finalPlayers[5] = document.getElementById("final-audio-6");

function beginFinalJourney() {

  finalPhase = "crossing";
  document.body.className = "final-walk-open";
  resetScroll();

  document.getElementById("home-street").style.display = "block";
  document.getElementById("interior-caption").innerHTML = "Scroll to cross the road and enter the building. Almost home.";

  playAudio(finalPlayers[0]);
}

function showElevatorLobby() {
  document.body.className = "after-bus-open";
  resetScroll();
  document.getElementById("home-street").style.display = "none";
  document.getElementById("elevator-lobby").style.display = "block";
  document.getElementById("interior-caption").innerHTML = "Waiting for the elevator. Click me to put on my headphones.";
}

function wearHeadphonesAgain() {
  if (finalPhase !== "waiting") { return; }
  finalPhase = "headphones";
  document.getElementById("elevator-lobby").style.display = "none";
  document.getElementById("headphones-scene").style.display = "block";
  document.body.className = "headphones-open";
  document.getElementById("interior-caption").innerHTML = "A little more music while I wait.";
  let video = document.getElementById("headphones-video");
  video.muted = true;
  video.currentTime = 25.75;
  video.pause();
  playAudio(finalPlayers[2]);
}

function resumeFinalVideo() {
  if (finalPhase === "headphones" && audio.currentTime >= 1.22) {
    document.getElementById("headphones-video").play();
  }
}

function pauseFinalVideo() {
  if (finalPhase === "headphones") { document.getElementById("headphones-video").pause(); }
}

function updateFinalScene() {
  let t = audio.currentTime;
  if (finalPhase === "building-entry") {
    if (t >= 2.7 && finalWalkProgress >= 0.98) {
      finalPhase = "waiting";
      showElevatorLobby();
    }
  } else if (finalPhase === "headphones") {
    let video = document.getElementById("headphones-video");
    if (t >= 1.22) {
      let target = 25.75 + t - 1.22;
      if (video.currentTime > target + 0.5 || video.currentTime < target - 0.5) { video.currentTime = target; }
      if (!audio.paused && video.paused) { video.play(); }
    }
  } else if (finalPhase === "elevator-arrival") {
    document.getElementById("elevator-indicator").innerHTML = "1";
    let opening = (t - 0.5) / 2.3;
    if (opening < 0) { opening = 0; }
    if (opening > 1) { opening = 1; }
    setElevatorDoors(50 - opening * 46);
  } else if (finalPhase === "elevator-closing") {
    let closing = t / 2.84;
    if (closing > 1) { closing = 1; }
    setElevatorDoors(4 + closing * 46);

  }
}

function setElevatorDoors(width) {
  document.getElementById("elevator-left").style.width = width + "%";
  document.getElementById("elevator-right").style.width = width + "%";
}

function nextFinalPhase() {
  if (finalPhase === "building-entry") {
    entrySoundFinished = true;
    if (finalWalkProgress >= 0.98) {
      finalPhase = "waiting";
      showElevatorLobby();
    }
  } else if (finalPhase === "headphones") {
    document.getElementById("headphones-video").pause();
    document.getElementById("headphones-scene").style.display = "none";
    document.body.className = "after-bus-open";
    document.getElementById("elevator-lobby").style.display = "block";
    document.getElementById("interior-caption").innerHTML = "The elevator is here.";
    finalPhase = "elevator-arrival";
    playAudio(finalPlayers[3]);
  } else if (finalPhase === "elevator-arrival") {
    finalPhase = "elevator-ready";
    setElevatorDoors(4);

    document.getElementById("elevator").className = "ready";
    document.getElementById("interior-caption").innerHTML = "Scroll down to step into the elevator.";
    document.body.className = "elevator-walk-open";
    resetScroll();
  } else if (finalPhase === "elevator-closing") {
    finalPhase = "end";
    setElevatorDoors(50);
    document.body.className = "story-ended";

    document.getElementById("ending-screen").style.display = "block";
    soundPlayer.style.display = "none";
    document.getElementById("interior-caption").style.display = "none";
  }
}

function enterElevator() {
  if (finalPhase !== "elevator-ready") { return; }
  finalPhase = "enter-elevator";
  document.getElementById("interior-caption").innerHTML = "Home, at last.";
  document.getElementById("lobby-person").style.zIndex = "0";

  playAudio(finalPlayers[4]);
}

function movePerson() {
  if (finalPhase === "elevator-ready" || finalPhase === "enter-elevator") {
    let progress = scrollProgress();
    document.getElementById("lobby-person").style.top = (320 - progress * 150) + "px";
    if (progress > 0.01 && finalPhase === "elevator-ready") { enterElevator(); }
    if (progress >= 0.99 && finalPhase === "enter-elevator") {
      finalPhase = "elevator-closing";
      playAudio(finalPlayers[5]);
    }
    return;
  }
  if (finalPhase === "crossing" || finalPhase === "building-entry") {
    finalWalkProgress = scrollProgress();
    let height = document.getElementById("home-street").clientHeight;
    let start = height - 100;
    if (start < 370) { start = 370; }
    let person = document.getElementById("home-person");
    person.style.bottom = "auto";
    person.style.top = (start + (80 - start) * finalWalkProgress) + "px";
    let walkers = document.getElementsByClassName("street-pedestrian");
    for (let i = 0; i < walkers.length; i++) {
      let origin = pedestrianStarts[i];
      let travel = pedestrianTravel[i];
      walkers[i].style.top = (origin + travel * finalWalkProgress) + "px";
    }
    if (finalWalkProgress >= 0.65 && finalPhase === "crossing") {
      finalPhase = "building-entry";

      playAudio(finalPlayers[1]);
    }
    if (finalWalkProgress >= 0.98 && entrySoundFinished) {
      finalPhase = "waiting";
      showElevatorLobby();
    }
    return;
  }
  if (hasSteppedOff) { return; }
  if (onBus) {
    if (seated) { return; }
    let progress = scrollProgress();
    let distance = window.innerHeight - 380;
    if (distance < 0) { distance = 0; }
    if (returningToBus) {
      let exitPosition = window.innerHeight - 260;
      if (exitPosition < 150) { exitPosition = 150; }
      document.getElementById("interior-person").style.top =
      (120 + progress * (exitPosition - 120)) + "px";
      if (progress >= 1 && announcementFinished) { stepOffBus(); }
    } else {
      document.getElementById("interior-person").style.top = (120 + progress * distance) + "px";
    }
    return;
  }
  if (outsideStarted) {

    document.getElementById("outside-scene").style.top =
    (-145 - window.scrollY) + "px";
    let outsideProgress = scrollProgress();
    if (outsideProgress >= 1) {
      if (!arrivedAtBusStop) {
        audio.pause();
        arrivedAtBusStop = true;
        if (!busArrivalStarted) {
          busArrivalStarted = true;
          startBusArrival();
        }
      }
    } else {
      arrivedAtBusStop = false;
    }
    let outsidePerson = document.getElementById("outside-person");
    let destination = 2350;
    let personPosition = 290 + outsideProgress * (destination - 290);
    outsidePerson.style.top = personPosition + "px";
    let companions = document.getElementsByClassName("road-companion");
    for (let i = 0; i < companions.length; i++) {
      let start = companionStarts[i];
      let rate = companionRates[i];
      let studentPosition = start + outsideProgress * (destination - 290) * rate;

      let stoppingPoint = 2360;
      if (companions[i].id === "road-companion3") {
        stoppingPoint = 1900;
      }
      if (rate > 0 && studentPosition > stoppingPoint) {
        studentPosition = stoppingPoint;
      }
      companions[i].style.top = studentPosition + "px";
    }
    let walkers = document.getElementsByClassName("walking-student");
    for (let i = 0; i < walkers.length; i++) {
      let start = walkerStarts[i];
      let speed = walkerSpeeds[i];
      walkers[i].style.top = (start + window.scrollY * speed) + "px";
    }
    let outsideCaption = document.getElementById("outside-caption");
    if (boardingReady) {
      outsideCaption.innerHTML = "Let’s get on! Click the bus to board.";
    } else if (outsideProgress >= 1 || busArrivalStarted) {
      outsideCaption.innerHTML = "So many people are waiting in line!";
    } else if (outsideProgress > 0.9) {
      outsideCaption.innerHTML = "The bus stop is crowded. Everyone is heading home.";
    } else if (outsideProgress > 0.65) {
      outsideCaption.innerHTML = "There’s the bus stop, just ahead.";
    } else {
      outsideCaption.innerHTML = "A breath of fresh air. Let’s walk to the bus stop.";
    }
    return;
  }
  let progress = scrollProgress();
  if (!journeyStarted) {
    progress = 0;
  }
  let distance = progress * 850;

  if (progress >= 0.8) {
    audio.pause();
    soundPlayer.style.display = "none";
  } else {
    soundPlayer.style.display = "block";
  }

  let position = 15 + distance / 10;
  if (position > 100) {
    position = 100;
  }
  person.style.top = position + "%";

  for (let i = 0; i < classmates.length; i++) {
    classmates[i].style.top =
    (startingPositions[i] + distance / walkingSpeeds[i]) + "%";
  }
  if (progress >= 1) {
    person.style.display = "none";
    caption.innerHTML = "Click anywhere to leave the school.";
  } else {
    person.style.display = "block";
    caption.innerHTML = "Class is finally over! Let’s head out of the building.";
  }
}

function prepareMedia() {
  let media = document.getElementsByClassName("story-media");
  for (let i = 0; i < media.length; i++) {
    if (media[i] !== audio) {
      preparingMedia[i] = true;
      media[i].muted = true;
      media[i].play();
    }
  }
}

function mediaPlayed(event) {
  let media = document.getElementsByClassName("story-media");
  for (let i = 0; i < media.length; i++) {
    if (preparingMedia[i] && event.target === media[i]) {
      preparingMedia[i] = false;
      if (event.target !== audio) {
        media[i].pause();
        media[i].currentTime = 0;
        if (media[i].id !== "headphones-video") { media[i].muted = false; }
        return;
      }
    }
  }
  if (event.target === audio) {
    showPause();
    resumeFinalVideo();
  }
}

function mediaPaused(event) {
  if (event.target === audio) {
    showPlay();
    pauseFinalVideo();
  }
}

function mediaProgressed(event) {
  if (event.target !== audio) { return; }
  updatePlayer();
  if (finalPhase !== "") {
    updateFinalScene();
  } else if (wearingHeadphones) {
    stopHeadphoneVideoAt19();
  } else if (onBus && seated) {
    fillBus();
  } else if (busArrivalStarted && !onBus) {
    moveBus();
  }
}

function mediaEnded(event) {
  if (event.target !== audio) { return; }
  showPlay();
  if (finalPhase !== "") {
    nextFinalPhase();
  } else if (wearingHeadphones) {
    returnToBus();
  } else if (returningToBus && !hasSteppedOff) {
    finishAnnouncement();
  } else if (onBus && !seated) {
    finishCard();
  } else if (busArrivalStarted && !onBus) {
    moveBus();
  }
}

let preparingMedia = [];
let storyMedia = document.getElementsByClassName("story-media");
for (let i = 0; i < storyMedia.length; i++) {
  storyMedia[i].addEventListener("play", mediaPlayed);
  storyMedia[i].addEventListener("pause", mediaPaused);
  storyMedia[i].addEventListener("timeupdate", mediaProgressed);
  storyMedia[i].addEventListener("ended", mediaEnded);
}

resizeScenes();
movePerson();
