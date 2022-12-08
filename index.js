(() => {
  const width = 320; // We will scale the photo width to this
  let height = 0; // This will be computed based on the input stream

  let streaming = false;

  //the readed devices
  let readedDevices = [];

  let devicelist = document.getElementById("inside");

  // The various HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  function showViewLiveResultButton() {
    if (window.self !== window.top) {
      // Ensure that if our document is in a frame, we get the user
      // to first open it in its own tab or window. Otherwise, it
      // won't be able to request permission for camera access.
      document.querySelector(".contentarea").remove();
      const button = document.createElement("button");
      button.textContent = "View live result of the example code above";
      document.body.append(button);
      button.addEventListener("click", () => window.open(location.href));
      return true;
    }
    return false;
  }

  //get connected devices
  const getConnectedDevices = async (type) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(
      (device) => device.kind === type && !device.label.includes("HD")
    );
  };

  function startup() {
    if (showViewLiveResultButton()) {
      return;
    }

    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    photo = document.getElementById("photo");
    startbutton = document.getElementById("startbutton");

    readAndUpdateDevice();

    video.addEventListener(
      "canplay",
      (ev) => {
        if (!streaming) {
          height = video.videoHeight / (video.videoWidth / width);

          // Firefox currently has a bug where the height can't be read from
          // the video, so we will make assumptions if this happens.

          if (isNaN(height)) {
            height = width / (4 / 3);
          }

          video.setAttribute("width", width);
          video.setAttribute("height", height);
          canvas.setAttribute("width", width);
          canvas.setAttribute("height", height);
          streaming = true;
        }
      },
      false
    );

    startbutton.addEventListener(
      "click",
      (ev) => {
        takepicture();
        ev.preventDefault();
      },
      false
    );

    clearphoto();

    navigator.mediaDevices.ondevicechange = () => {
      updateList();
      console.log("device change");
    };
  }

  const readAndUpdateDevice = () => {
    updateDeviceTable();
    devicelist.addEventListener("change", (event) => {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            deviceId: {
              exact: event.target.value,
            },
          },
          audio: false,
        })
        .then((stream) => {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          console.error(`An error occurred: ${err}`);
        });
    });
  };

  updateDeviceTable = () => {
    getConnectedDevices("videoinput").then((devices) => {
      readedDevices = devices;
      console.table(readedDevices);

      //listen for the change event
      updateList();
    });
  };
  const updateList = () => {
    updateDeviceTable();
    readedDevices.forEach((device) => {
      // //remove old options exept the first one
      while (devicelist.options.length > 1) {
        devicelist.remove(1);
      }

      const option = document.createElement("option");
      option.value = device.deviceId;
      option.text = device.label;
      devicelist.appendChild(option);
    });
  };

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    const context = canvas.getContext("2d");
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const data = canvas.toDataURL("image/png");
    photo.setAttribute("src", data);
  }

  function takepicture() {
    const context = canvas.getContext("2d");
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);

      const data = canvas.toDataURL("image/png");
      photo.setAttribute("src", data);
    } else {
      clearphoto();
    }
  }

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener("load", startup, false);
})();
