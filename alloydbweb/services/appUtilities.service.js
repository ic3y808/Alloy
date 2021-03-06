import CryptoJS from "crypto-js";
import moment from "moment";

export default class AppUtilities {
  constructor($rootScope, $timeout, Logger) {
    "ngInject";
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.Logger = Logger;
    this.$rootScope.goBack = this.goBack;
    this.$rootScope.goForward = this.goForward;
    this.$rootScope.getBackgroundStyle = this.getBackgroundStyle;
    this.$rootScope.apply = this.apply;
    this.$rootScope.updateGridRows = this.updateGridRows;
    this.$rootScope.decryptPassword = this.decryptPassword;
    this.$rootScope.formatTime = this.formatTime;
    this.$rootScope.formatUnixTime = this.formatUnixTime;
    this.$rootScope.humanFileSize = this.humanFileSize;
  }

  broadcast(e, d) {
    this.$rootScope.$broadcast(e, d);
  }

  apply() {
    if (!this.$rootScope.$$phase) {
      //$digest or $apply
      this.$rootScope.$digest();
    }
  }

  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
  }

  getBackgroundStyle(imagepath) {
    if (imagepath === undefined || imagepath === "" || imagepath === null) { return ""; }
    return {
      "background-image": "url(" + imagepath + ")"
    };
  }

  shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        const index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        const temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}
  showLoader() {
    $("#root.root").css("display", "none");
    $(".loader").css("display", "block");
  }

  hideLoader() {
    $(".loader").css("display", "none");
    $("#root.root").css("display", "initial");
  }

  setContentBackground(img) {
    if (img) {
      var bgUrl = img.replace("300x300", Math.round($(".art-backdrop").width()) + "x" + Math.round($(".art-backdrop").height()));
      $(".art-backdrop").css("background-image", "url(" + bgUrl + ")");
      this.apply();
    }
  }

  resetContentBackground() {
    $(".art-backdrop").css("background-image", "url(\"\")");
  }

  updateGridRows(gridOptions) {
    this.$timeout(function () {
      if (gridOptions && gridOptions.api) {
        gridOptions.api.redrawRows({
          force: true
        });
        gridOptions.api.doLayout();
        gridOptions.api.sizeColumnsToFit();
      }
    });
  }

  showNoRows(gridOptions) {
    if (gridOptions && gridOptions.api) {
      gridOptions.api.showNoRowsOverlay();
    }
  }

  setRowData(gridOptions, data) {
    if (gridOptions && gridOptions.api) {
      gridOptions.api.setRowData(data);
      this.updateGridRows(gridOptions);
    }
  }

  fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      Logger.info("Fallback: Copying text command was " + msg);
    } catch (err) {
      Logger.error("Fallback: Oops, unable to copy" + JSON.stringify(err));
    }

    document.body.removeChild(textArea);
  }

  copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function () {

    }, function (err) {
      console.error("Async: Could not copy text: ", err);
    });
  }

  humanFileSize(size) {
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (
      ((size / Math.pow(1024, i)).toFixed(2) * 1) +
      " " +
      ["B", "kB", "MB", "GB", "TB"][i]
    );
  }

  formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
  }

  formatUnixTime(seconds) {
    var dateString = moment.unix(seconds).format("MM/DD/YY hh:mm");
    return dateString;
  }

  msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100, 10),
      seconds = parseInt((duration / 1000) % 60, 10),
      minutes = parseInt((duration / (1000 * 60)) % 60, 10),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }

  debounce(func, wait, immediate) {
    var timeout = null;
    return () => {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) { func.apply(context, args); }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) { func.apply(context, args); }
    };
  }

  getRandom(arr, n) {
    var index = n;
    var result = new Array(index),
      len = arr.length,
      taken = new Array(len);
    if (index > len) { throw new RangeError("getRandom: more elements taken than available"); }
    while (index--) {
      var x = Math.floor(Math.random() * len);
      result[index] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  encryptPassword(pass) {
    return CryptoJS.AES.encrypt(pass, "12345").toString();

  }

  decryptPassword(pass) {
    return CryptoJS.AES.decrypt(pass, "12345").toString(CryptoJS.enc.Utf8);
  }

  //shuffle(array) {
  //  var currentIndex = array.length, temporaryValue, randomIndex;
  //  while (0 !== currentIndex) {
  //    randomIndex = Math.floor(Math.random() * currentIndex);
  //    var existing = array[currentIndex];
  //    var existing2 = array[randomIndex];
  //    if (existing && existing2) {
  //      while (true) {
  //        if (array[randomIndex].artist === array[currentIndex].artist)
  //          randomIndex = Math.floor(Math.random() * currentIndex);
  //        else break;
  //      }
  //    }
  //    currentIndex -= 1;
  //    temporaryValue = array[currentIndex];
  //    array[currentIndex] = array[randomIndex];
  //    array[randomIndex] = temporaryValue;
  //  }
  //  return array;
  //}
}