import './style.css'
import * as myCode from './myCode'

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

myCode.startApp()

