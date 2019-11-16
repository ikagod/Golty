let channels = [];

function updateCheckingInterval() {
  startSpinner("update-checking-interval-spinner")
  let checkingInterval
  let checkingIntervalInput = document.getElementById("checking-interval").value
  let time = document.getElementById("time").value

  if (time == "minutes") {
    checkingInterval = checkingIntervalInput 
  } else if (time == "hours") {
    checkingInterval = checkingIntervalInput * 60
  } else if (time == "days") {
    checkingInterval = checkingIntervalInput * 1440
  }

  interval = {
    checkingInterval
  }

  const options = {
    method: "POST",
    body: JSON.stringify(interval),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  };

  fetch("/api/update-checking-interval-playlists", options)
    .then(res => res.json())
    .then(res => {
      handleResponse(res)
      stopSpinner("update-checking-interval-spinner")
    });
}

function addPlaylist() {
  startSpinner("add-playlist-spinner")
  let downloadEntirePlaylist = document.querySelector('#download-entire-playlist').checked;
  let playlistURL = document.getElementById("playlist-url").value
  let downloadMode = document.getElementById("download-mode").value
  let fileExtension = document.getElementById("file-extension").value
  let downloadQuality = document.getElementById("download-quality").value

  let playlistData = {
    playlistURL,
    downloadMode,
    fileExtension,
    downloadQuality,
    downloadEntirePlaylist,
  };

  const options = {
    method: "POST",
    body: JSON.stringify(playlistData),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  };

  fetch("/api/add-playlist", options)
    .then(res => res.json())
    .then(res => {
      handleResponse(res)
      stopSpinner("add-playlist-spinner")
      getChannels()
    });
}

function checkAll() {
  startSpinner("check-all-spinner")
  fetch("/api/check-all")
    .then(res => res.json())
    .then(res => {
      handleResponse(res)
      stopSpinner("check-all-spinner")
      getChannels()
    });
}

function getChannels() {
  fetch("/api/get-channels")
    .then(res => res.json())
    .then(channels => {
      displayChannels(channels);
    });
}

function checkChannel(id) {
  startSpinner(id+"-spinner")
  let channelURL = id
  let downloadMode = document.getElementById("download-mode").value
  let fileExtension = document.getElementById("file-extension").value
  let downloadQuality = document.getElementById("download-quality").value

  let channelData = {
    channelURL,
    downloadMode,
    fileExtension,
    downloadQuality
  };

  const options = {
    method: "POST",
    body: JSON.stringify(channelData),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  };

  fetch("/api/check-channel", options)
    .then(res => res.json())
    .then(res => {
      console.log(res);
      stopSpinner(id+"-spinner")
      if (res.Type == "Success") {
        if (res.Key == "NO_NEW_VIDEOS") {
          displayWarningMessage(res.Message);
          getChannels()
        } else if (res.Key == "NEW_VIDEO_DETECTED") {
          displaySuccessMessage(res.Message);
          getChannels()
        }
      } else if (res.Type == "Error") {
        if (res.Key == "ERROR_DOWNLOADING_VIDEO") {
          displayErrorMessage(res.Message);
        }
      }
    });
}

function deleteChannel(id) {
  let channelURL = {
    channelURL: id
  };

  const options = {
    method: "POST",
    body: JSON.stringify(channelURL),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  };

  fetch("/api/delete-channel", options)
    .then(res => res.json())
    .then(res => {
      handleResponse(res)
      getChannels()
    });
}

function removeFromList(channelURL) {
  channelURL = channelURL.replace("delChannel", "");

  let channels = document.getElementById("channels");
  let li = document.getElementById(channelURL + "listElem");
  console.log(channels);
  channels.removeChild(li);
}


function displayErrorMessage(message) {
  let error = document.getElementById("error");
  error.innerHTML = ""
  error.classList.remove("d-none");
  error.innerHTML = `${message} <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`;
}

function displaySuccessMessage(message) {
  let success = document.getElementById("success");

  if (success) {
    console.log("DISPLAY SUCCESS ALERT")

    success.innerHTML = ""
    success.classList.remove("d-none");
    success.innerHTML = `${message} <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`;
  } else {
    console.log("CREATE SUCCESS ALERT")
    let alertsDiv = document.getElementById("alerts").innerHTML
    alertsDiv += `<div class="alert alert-success alert-dismissible mt-3" id="success" role="alert">
                    ${message}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                  </div>`
  }
}

function displayWarningMessage(message) {
  let warning = document.getElementById("warning");
  warning.innerHTML = ""
  warning.classList.remove("d-none");
  warning.innerHTML = `${message} <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>`;
}

function displayChannels(channels) {
  document.getElementById("accordion").innerHTML = ""
  console.log(channels)
  channels.forEach((channel, index) => {
    console.log(channel)
    document.getElementById("accordion").innerHTML += `<div class="mb-2 p-2 card">
      <h5 class="mb-0">
        <button class="btn btn-link dropdown-toggle" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}" id=${channel.ChannelURL}listElem>
          ${channel.Name}
        </button><button class="btn btn-danger float-right ml-2" id="${channel.ChannelURL +
        "delChannel"}" onClick="deleteChannel(this.id)">&times</button><button class="btn btn-primary float-right" id="${channel.ChannelURL}" onClick="checkChannel(this.id)">Check Now<div id="${channel.ChannelURL}-spinner" class="spinner-border align-middle ml-2 d-none"></div></button>
      </h5>
  
      <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordion">
        <div class="panel-body ml-2">
          Latest Download: <a href=https://www.youtube.com/watch?v=${channel.LatestDownloaded} target="_blank">https://www.youtube.com/watch?v=${channel.LatestDownloaded}</a>
          <p>Download Mode: ${channel.DownloadMode}</p>
          <p>Last Checked: ${channel.LastChecked}</p>
          <p>Preferred Extension For Audio: ${channel.PreferredExtensionForAudio}
          <p>Preferred Extension For Video: ${channel.PreferredExtensionForVideo}
          <br>
          <button class="btn btn-link dropdown-toggle" type="button" data-toggle="collapse" data-target="#history${index}" aria-expanded="false" aria-controls="history${index}">
            Download History
          </button>
          <div class="collapse" id="history${index}">
            <div class="card card-body" id="dlhistory${channel.Name}">
            </div>
          </div>
        </h5>
        </div>
      </div>
    </div>`
    displayDownloadHistory(channel.Name, channel.DownloadHistory)
  })
}

function displayDownloadHistory(channelName, downloadHistory) {
  let historyBox = document.getElementById("dlhistory"+channelName)
  console.log(historyBox)
  console.log("DISPLAY HISTORY")
  downloadHistory.forEach(video => {
    historyBox.innerHTML += `<br> <a href=https://www.youtube.com/watch?v=${video} target="_blank">https://www.youtube.com/watch?v=${video}</a>` 
  })
}

function handleResponse(res) {
  if (res.Type == "Success") {
    displaySuccessMessage(res.Message)
  } else if (res.Type == "Error") {
    displayErrorMessage(res.Message)
  } else if (res.Type == "Warning") {
    displayWarningMessage(res.Message)
  }
}

function startSpinner(id) {
  spinner = document.getElementById(id);
  spinner.classList.remove("d-none");
}

function stopSpinner(id) {
  spinner = document.getElementById(id);
  spinner.classList.add("d-none")
}

function changeExtension() {
  console.log("change ext")
  let downloadMode = document.getElementById("download-mode").value
  let fileExtensions = document.getElementById("file-extension")
  let downloadQualities = document.getElementById("download-quality")
  if (downloadMode == "Audio Only") {
    fileExtensions.options[0].value = "m4a"
    fileExtensions.options[0].text = "m4a"
    fileExtensions.options[1].value = "mp3"
    fileExtensions.options[1].text = "mp3"
    downloadQualities.options[0].value = "best"
    downloadQualities.options[0].text = "best"
    downloadQualities.options[1].value = "medium"
    downloadQualities.options[1].text = "medium"
    downloadQualities.options[2].value = "worst"
    downloadQualities.options[2].text = "worst"
  } else if (downloadMode == "Video And Audio") {
    fileExtensions.options[0].value = "any"
    fileExtensions.options[0].text = "any (recommended for now)"
    fileExtensions.options[1].value = "mp4"
    fileExtensions.options[1].text = "mp4"
    // fileExtensions.options[2].value = ".mkv"
    // fileExtensions.options[2].text = ".mkv"
    
    downloadQualities.options[0].value = "best"
    downloadQualities.options[0].text = "best"
    downloadQualities.options[1] = null
    downloadQualities.options[2].value = "worst"
    downloadQualities.options[2].text = "worst"
  }
}