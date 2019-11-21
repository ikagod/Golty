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
  let downloadEntire = document.querySelector('#download-entire-playlist').checked;
  let URL = document.getElementById("playlist-url").value
  let downloadMode = document.getElementById("download-mode").value
  let fileExtension = document.getElementById("file-extension").value
  let downloadQuality = document.getElementById("download-quality").value

  let playlistData = {
    URL,
    downloadMode,
    fileExtension,
    downloadQuality,
    downloadEntire,
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
      getPlaylists()
    });
}

function checkAll() {
  startSpinner("check-all-spinner")
  fetch("/api/check-all-playlists")
    .then(res => res.json())
    .then(res => {
      handleResponse(res)
      stopSpinner("check-all-spinner")
      getPlaylists()
    });
}

function getPlaylists() {
  fetch("/api/get-playlists")
    .then(res => res.json())
    .then(playlists => {
      displayPlaylists(playlists);
      getVersion();
    });
}

function checkPlaylist(id) {
  startSpinner(id+"-spinner")
  let URL = id
  let downloadMode = document.getElementById("download-mode").value
  let fileExtension = document.getElementById("file-extension").value
  let downloadQuality = document.getElementById("download-quality").value

  let channelData = {
    URL,
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

  fetch("/api/check-playlist", options)
    .then(res => res.json())
    .then(res => {
      console.log(res);
      stopSpinner(id+"-spinner")
      if (res.Type == "Success") {
        if (res.Key == "NO_NEW_VIDEOS") {
          displayWarningMessage(res.Message);
          getPlaylists()
        } else if (res.Key == "NEW_VIDEO_DETECTED") {
          displaySuccessMessage(res.Message);
          getPlaylists()
        }
      } else if (res.Type == "Error") {
        if (res.Key == "ERROR_DOWNLOADING_VIDEO") {
          displayErrorMessage(res.Message);
        }
      }
    });
}

function deletePlaylist(id) {
  let playlistURL = {
    URL: id
  };

  const options = {
    method: "POST",
    body: JSON.stringify(playlistURL),
    headers: new Headers({
      "Content-Type": "application/json"
    })
  };

  fetch("/api/delete-playlist", options)
    .then(res => res.json())
    .then(res => {
      handleResponse(res)
      getPlaylists()
    });
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

function displayPlaylists(playlists) {
  document.getElementById("accordion").innerHTML = ""
  console.log(channels)
  playlists.forEach((playlist, index) => {
    console.log(playlist)
    document.getElementById("accordion").innerHTML += `<div class="mb-2 p-2 card">
      <h5 class="mb-0">
        <button class="btn btn-link dropdown-toggle" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}" id=${playlist.URL}listElem>
          ${playlist.Name}
        </button><button class="btn btn-danger float-right ml-2" id="${playlist.URL +
        "delPlaylist"}" onClick="deletePlaylist(this.id)">&times</button><button class="btn btn-primary float-right" id="${playlist.URL}" onClick="checkPlaylist(this.id)">Check<div id="${playlist.URL}-spinner" class="spinner-border align-middle ml-2 d-none"></div></button>
      </h5>
  
      <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordion">
        <div class="panel-body ml-2">
          Latest Download: <a href=https://www.youtube.com/watch?v=${playlist.LatestDownloaded} target="_blank">https://www.youtube.com/watch?v=${playlist.LatestDownloaded}</a>
          <p>Download Mode: ${playlist.DownloadMode}</p>
          <p>Last Checked: ${playlist.LastChecked}</p>
          <p>Preferred Extension For Audio: ${playlist.PreferredExtensionForAudio}
          <p>Preferred Extension For Video: ${playlist.PreferredExtensionForVideo}
          <br>
          <button class="btn btn-link dropdown-toggle" type="button" data-toggle="collapse" data-target="#history${index}" aria-expanded="false" aria-controls="history${index}">
            Download History
          </button>
          <div class="collapse" id="history${index}">
            <div class="card card-body" id="dlhistory${playlist.Name}">
            </div>
          </div>
        </h5>
        </div>
      </div>
    </div>`
    displayDownloadHistory(playlist.Name, playlist.DownloadHistory)
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