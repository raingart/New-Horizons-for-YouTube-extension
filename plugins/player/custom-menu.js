_plugins_conteiner.push({
   id: 'player-buttons-custom',
   title: 'Custom buttons',
   run_on_pages: 'watch, embed',
   section: 'player',
   // desc: '',
   _runtime: user_settings => {

      const
         SELECTOR_BTN_CLASS_NAME = 'custom-button',
         SELECTOR_BTN = '.' + SELECTOR_BTN_CLASS_NAME, // for css
         player = document.getElementById('movie_player'),
         getVidId = () => YDOM.queryURL.get('v', player?.getVideoUrl() || document.querySelector('link[rel="canonical"][href]')?.href); // fix for embed

      YDOM.waitElement('.ytp-right-controls')
         .then(container => {
            // global
            YDOM.css.push(
               `button${SELECTOR_BTN} {
                  padding: 0 7px;
               }

               button${SELECTOR_BTN} svg {
                  fill: white;
                  width: 80%;
               }

               button${SELECTOR_BTN}:hover svg { fill: #66afe9; }
               button${SELECTOR_BTN}:active svg { fill: #2196f3; }`);

            // Pop-up player
            if (user_settings.player_buttons_custom_items.indexOf('popup') !== -1) {
               const btnPopUp = document.createElement('button');
               btnPopUp.className = `ytp-button ${SELECTOR_BTN_CLASS_NAME}`;
               btnPopUp.title = 'Autoplay is off';
               // btnPopUp.setAttribute('aria-label','');
               btnPopUp.innerHTML = '<svg version="1.1" viewBox="0 0 20 20" height="100%" width="100%"><path d="M18 2H6v4H2v12h12v-4h4V2z M12 16H4V8h2v6h6V16z M16 12h-2h-2H8V8V6V4h8V12z"/></svg>';
               btnPopUp.addEventListener('click', () => {
                  const
                     width = 533,
                     height = Math.round(width / (16 / 9)),
                     left = window.innerWidth, //(window.innerWidth) / 2 - (width / 2),
                     top = window.innerHeight, //(window.innerHeight / 2) - (height / 2),
                     currentTime = Math.floor(document.querySelector('video')?.currentTime),
                     url = new URL(
                        document.querySelector('link[itemprop="embedUrl"][href]')?.href
                        || ('https://www.youtube.com/embed/' + getVidId()));
                  // list param ex.
                  // https://www.youtube.com/embed/PBlOi5OVcKs?start=0&amp;playsinline=1&amp;controls=0&amp;fs=20&amp;disablekb=1&amp;rel=0&amp;origin=https%3A%2F%2Ftyping-tube.net&amp;enablejsapi=1&amp;widgetid=1

                  if (+currentTime) url.searchParams.append('start', currentTime);
                  url.searchParams.append('autoplay', 1);

                  window.open(url.href, document.title, `width=${width},height=${height},left=${left},top=${top}`);
               });
               container.prepend(btnPopUp);
            }

            if (user_settings.player_buttons_custom_items.indexOf('screenshot') !== -1) {
               const
                  // bar
                  SELECTOR_SCREENSHOT_ID = 'screenshot-result',
                  SELECTOR_SCREENSHOT = '#' + SELECTOR_SCREENSHOT_ID; // for css

               YDOM.css.push(
                  SELECTOR_SCREENSHOT + ` {
                     --width: 400px;
                     --height: 400px;

                     position: fixed;
                     top: 0;
                     right: 0;
                     overflow: hidden;
                     margin: 30px;
                     box-shadow: 0 0 15px #000;
                     max-width: var(--width);
                     max-height: var(--height);
                     z-index: 300;
                  }

                  ${SELECTOR_SCREENSHOT} canvas {
                     max-width: var(--width);
                     max-height: var(--height);
                     /* object-fit: contain; */
                  }

                  ${SELECTOR_SCREENSHOT} a {
                     bottom: 0;
                     right: 0;
                     background: rgba(0, 0, 0, .5);
                     color: #FFF;
                     cursor: pointer;
                     font-size: 12px;
                     padding: 5px;
                     position: absolute;
                  }
                  ${SELECTOR_SCREENSHOT}:hover a { background: rgba(0, 0, 0, .65); }
                  ${SELECTOR_SCREENSHOT} a:hover { background: rgba(0, 0, 0, .8); }`);

               const btnScreenshot = document.createElement('button');
               btnScreenshot.className = `ytp-button ${SELECTOR_BTN_CLASS_NAME}`;
               btnScreenshot.title = 'Take screenshot';
               // btnScreenshot.setAttribute('aria-label','');
               btnScreenshot.innerHTML =
                  `<svg viewBox="0 0 512 512" height="100%" width="100%" version="1.1">
                     <g>
                        <circle cx="255.811" cy="285.309" r="75.217"/>
                        <path d="M477,137H352.718L349,108c0-16.568-13.432-30-30-30H191c-16.568,0-30,13.432-30,30l-3.718,29H34 c-11.046,0-20,8.454-20,19.5v258c0,11.046,8.954,20.5,20,20.5h443c11.046,0,20-9.454,20-20.5v-258C497,145.454,488.046,137,477,137 z M255.595,408.562c-67.928,0-122.994-55.066-122.994-122.993c0-67.928,55.066-122.994,122.994-122.994 c67.928,0,122.994,55.066,122.994,122.994C378.589,353.495,323.523,408.562,255.595,408.562z M474,190H369v-31h105V190z"/>
                     </g>
                  </svg>`;
               btnScreenshot.addEventListener('click', () => {
                  const
                     video = document.querySelector('video'),
                     container = document.getElementById(SELECTOR_SCREENSHOT_ID) || document.createElement('a'),
                     canvas = container.querySelector('canvas') || document.createElement('canvas'),
                     context = canvas.getContext('2d'),
                     aspectRatio = video.videoWidth / video.videoHeight,
                     width = video.videoWidth,
                     height = parseInt(width / aspectRatio, 10);

                  canvas.width = width;
                  canvas.height = height;
                  context.drawImage(video, 0, 0, width, height);
                  // container.href = canvas.toDataURL('image/png'); // does not work
                  canvas.toBlob(blob => container.href = URL.createObjectURL(blob));
                  // create
                  if (!container.id) {
                     container.id = SELECTOR_SCREENSHOT_ID;
                     container.target = '_blank'; // useful link
                     container.title = 'Click to save';
                     canvas.addEventListener('click', evt => {
                        evt.preventDefault();
                        // document.location.href = target.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                        downloadCanvasAsImage(evt.target);
                        evt.target.parentNode.remove();
                     });
                     container.appendChild(canvas);
                     const close = document.createElement('a');
                     // close.id =
                     // close.className =
                     close.textContent = 'CLOSE';
                     close.addEventListener('click', evt => {
                        evt.preventDefault();
                        evt.target.parentNode.remove();
                     });
                     container.appendChild(close);
                     document.body.appendChild(container);
                  }
               });

               function downloadCanvasAsImage(canvas) {
                  const downloadLink = document.createElement('a');
                  downloadLink.setAttribute('download', (+new Date()) + '.png');
                  const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                  downloadLink.href = image;
                  downloadLink.click();
               }
               container.prepend(btnScreenshot);
            }

            if (user_settings.player_buttons_custom_items.indexOf('thumbnail') !== -1) {
               const btnThumb = document.createElement('button');
               btnThumb.className = `ytp-button ${SELECTOR_BTN_CLASS_NAME}`;
               btnThumb.title = 'Open thumbnail';
               btnThumb.innerHTML =
                  `<svg viewBox="0 0 20 20" height="100%" width="100%" version="1.1">
                     <circle cx='8' cy='7.2' r='2'/>
                     <path d='M0 2v16h20V2H0z M18 16H2V4h16V16z'/>
                     <polygon points='17 10.9 14 7.9 9 12.9 6 9.9 3 12.9 3 15 17 15'/>
                  </svg>`;
               btnThumb.addEventListener('click', () =>
                  window.open(`https://i.ytimg.com/vi/${getVidId()}/maxresdefault.jpg`));
               container.prepend(btnThumb);
            }

            if (user_settings.player_buttons_custom_items.indexOf('toggle-speed') !== -1) {
               const
                  video = document.querySelector('video'),
                  btnSpeed = document.createElement('a');
               let prevRate = {};

               // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#events
               ["ratechange", "loadeddata"].forEach(evt => {
                  video.addEventListener(evt, btnSpeedVisibilitySwitch.bind(video));
               });

               btnSpeed.className = `ytp-button ${SELECTOR_BTN_CLASS_NAME}`;
               btnSpeed.style.textAlign = 'center';
               btnSpeed.style.fontWeight = 'bold';
               btnSpeed.title = 'Toggle speed';
               btnSpeed.textContent = '1x';
               btnSpeed.addEventListener('click', ({ target }) => {
                  // restore
                  if (Object.keys(prevRate).length) {
                     setRate(prevRate);
                     prevRate = {};
                     target.textContent = '1x';

                  } else { // return default
                     const rate = video.playbackRate;
                     prevRate = (rate !== 1)
                        ? { 'html5': rate }
                        : { 'default': player.getPlaybackRate() };

                     let resetRate = Object.assign({}, prevRate); // clone obj
                     if (resetRate.hasOwnProperty('html5')) resetRate.html5 = 1;
                     else resetRate.default = 1;
                     setRate(resetRate);
                     target.textContent = prevRate[Object.keys(prevRate)[0]] + 'x';
                  }
                  btnSpeed.title = 'Switch to ' + target.textContent;
                  // console.debug('prevRate', prevRate);
               });

               function btnSpeedVisibilitySwitch() {
                  if (Object.keys(prevRate).length) return;
                  btnSpeed.style.visibility = this.playbackRate === 1 ? 'hidden' : 'visible';
               }

               function setRate(obj) {
                  if (obj.hasOwnProperty('html5')) {
                     video.playbackRate = obj.html5;

                  } else {
                     player.setPlaybackRate(obj.default);
                  }
               }
               container.prepend(btnSpeed);
            }
         });

   },
   options: {
      player_buttons_custom_items: {
         _tagName: 'select',
         label: 'Items',
         title: 'Hold Ctrl+Сlick to select several',
         multiple: null, // dont use - selected: true
         size: 4, // = options.length
         options: [
            { label: 'toggle speed', value: 'toggle-speed' },
            { label: 'screenshot', value: 'screenshot' },
            { label: 'thumbnail', value: 'thumbnail' },
            { label: 'pop-up player', value: 'popup' },
         ],
      },
   },
});
