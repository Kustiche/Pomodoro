class Pomodoro {
  constructor(pomodoro, short, long) {
    this.TIMER_INTERVAL = 1000;
    this.NOTIFICATION_DURATION = 3000;

    this.pomodoro = JSON.parse(localStorage.getItem('pomodoroValue')) ?? pomodoro * 60;
    this.short = JSON.parse(localStorage.getItem('shortValue')) ?? short * 60;
    this.long = JSON.parse(localStorage.getItem('longValue')) ?? long * 60;

    this.totalTime = this.pomodoro;
    this.seconds = 0;
    this.interval = null;
    this.notificationTimeout = null;
    this.typeTimer = 'pomodoro';
    this.numIterations = 0;
    this.circumference = 2 * Math.PI * 145;
    this.emojis = {
      pomodoro: '🔴',
      short: '🟡',
      long: '🟢',
    };

    this.progressCircle = document.querySelector('.pomodoro__timer-progress');
    this.timer = document.querySelector('.pomodoro__timer');
    this.btnStart = document.querySelector('.functional__start');
    this.btnReset = document.querySelector('.functional__reset');
    this.form = document.querySelector('.form');
    this.inputPomodoro = document.getElementById('pomodoro');
    this.inputShort = document.getElementById('short');
    this.inputLong = document.getElementById('long');
    this.btnCloseForm = document.querySelector('.form__close');
    this.btnPomodoro = document.querySelector('.types-timers__pomodoro');
    this.btnShort = document.querySelector('.types-timers__short');
    this.btnLong = document.querySelector('.types-timers__long');
    this.innerTypesTimers = document.querySelector('.pomodoro__types-timers');
    this.notification = document.querySelector('.notification');
    this.notificationText = document.querySelector('.notification__text');
    this.audioNotification = document.getElementById('audio-notification');

    this.btnsPomodoro = document.querySelectorAll('.pomodoro-btn');

    this.modalSettings = document.querySelector('#modalSettings');

    this.startListeners();
    this.updateTimer('pomodoro');
    this.distributionParameters();
    this.changeTitleSite();
  }

  startListeners() {
    this.btnStart.addEventListener('click', () => {
      const isClassActive = this.btnStart.classList.contains('active');

      if (isClassActive) {
        this.btnStart.classList.remove('active');
        this.stop();
        this.changeIcon(false);
      } else {
        this.btnStart.classList.add('active');
        this.start();
        this.changeIcon(true);
      }
    });

    this.btnReset.addEventListener('click', () => {
      this.progressCircle.style.strokeDashoffset = 0;

      this.updateTimer('pomodoro');
      this.stop();
      this.changeActiveButton(this.btnPomodoro);

      this.btnStart.classList.remove('active');
      this.changeIcon(false);
      this.changeTitleSite();
    });

    this.modalSettings.addEventListener('click', (e) => {
      const isModalWrap = e.target.closest('.settings__wrap');

      if (!isModalWrap) {
        this.distributionParameters();
        this.closeModal();
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isPositiveValue = this.inputPomodoro.value < 1 || this.inputShort.value < 1 || this.inputLong.value < 1;

      try {
        if (isPositiveValue) {
          throw new Error('Incorrect number');
        }

        this.saveParameters();
        this.updateParameters();
        this.updateTimer('pomodoro');
        this.changeActiveButton(this.btnPomodoro);
        this.renderTimer();
        this.stop();

        this.btnStart.classList.remove('active');
        this.changeIcon(false);
        this.progressCircle.style.strokeDashoffset = 0;
        this.changeTitleSite();
      } catch (err) {
        this.changeTextNotification(true, err);
        this.distributionParameters();
      }

      this.closeModal();
    });

    this.btnCloseForm.addEventListener('click', () => {
      this.distributionParameters();
    });

    this.innerTypesTimers.addEventListener('click', (e) => {
      const isNotContainer = e.target !== this.innerTypesTimers;
      const isClassActiveTimer = e.target.classList.contains('activeTimer');

      if (isNotContainer && !isClassActiveTimer) {
        switch (e.target) {
          case this.btnPomodoro:
            this.changeActiveButton(this.btnPomodoro, 'pomodoro', true);
            this.updateTimer('pomodoro');
            break;
          case this.btnShort:
            this.changeActiveButton(this.btnShort, 'short', true);
            this.updateTimer('short');
            break;
          case this.btnLong:
            this.changeActiveButton(this.btnLong, 'long', true);
            this.updateTimer('long');
            break;
        }

        this.progressCircle.style.strokeDashoffset = 0;
        this.stop();
        this.btnStart.classList.remove('active');
        this.changeIcon(false);
        this.changeTitleSite();
        this.changeTextNotification(false);
      }
    });
  }

  changeTitleSite() {
    document.title = `${this.emojis[this.typeTimer]} ${this.calculationTiming()} | Pomodoro`;
  }

  changeIcon(active) {
    const use = document.querySelector('use');
    const useHref = use.getAttribute('href');
    const spritePath = useHref.split('#')[0];

    if (active) {
      this.btnStart.innerHTML = `<svg class="functional__icon"><use href="${spritePath}#start"></use></svg>`;
    } else {
      this.btnStart.innerHTML = `<svg class="functional__icon"><use href="${spritePath}#pause"></use></svg>`;
    }
  }

  start() {
    this.interval = setInterval(() => {
      if (this.seconds === 0) {
        this.switchTimer(this.typeTimer);
        this.playNotificationSound();
        this.changeTextNotification(false);
      } else {
        this.seconds = --this.seconds;

        this.renderTimer();
        this.changeTitleSite();
      }

      const offset = this.circumference - (this.seconds / this.totalTime) * this.circumference;
      this.progressCircle.style.strokeDashoffset = offset;
    }, this.TIMER_INTERVAL);
  }

  calculationTiming() {
    const calculationMinutes = Math.floor(this.seconds / 60);
    const calculationSeconds = this.seconds % 60 === 0 ? '00' : `${this.seconds % 60 < 10 ? `0${this.seconds % 60}` : this.seconds % 60}`;
    const result = `${calculationMinutes}:${calculationSeconds}`;

    return result;
  }

  renderTimer() {
    this.timer.textContent = `${this.calculationTiming()}`;
  }

  switchTimer(type) {
    const isTypePomodoro = type === 'pomodoro';

    if (isTypePomodoro) {
      this.numIterations = ++this.numIterations;
      this.seconds = this.short;
      this.typeTimer = 'short';
      this.totalTime = this.short;

      if (this.numIterations === 4) {
        this.seconds = this.long;
        this.typeTimer = 'long';
        this.totalTime = this.long;
        this.numIterations = 0;
      }
    } else {
      this.seconds = this.pomodoro;
      this.typeTimer = 'pomodoro';
      this.totalTime = this.pomodoro;
    }

    switch (this.typeTimer) {
      case 'pomodoro':
        this.changeActiveButton(this.btnPomodoro);

        break;
      case 'short':
        this.changeActiveButton(this.btnShort);

        break;
      case 'long':
        this.changeActiveButton(this.btnLong);

        break;
    }
  }

  stop() {
    clearInterval(this.interval);
  }

  updateTimer(type) {
    this.typeTimer = type;
    this.numIterations = 0;
    this.seconds = this[type];
    this.totalTime = this[type];

    this.renderTimer();
  }

  calculationSecondsParameters(value) {
    const result = value > 60 ? 60 * 60 : value * 60;

    return result;
  }

  distributionParameters() {
    this.inputPomodoro.value = this.pomodoro / 60;
    this.inputShort.value = this.short / 60;
    this.inputLong.value = this.long / 60;
  }

  updateParameters() {
    this.pomodoro = this.calculationSecondsParameters(this.inputPomodoro.value);
    this.short = this.calculationSecondsParameters(this.inputShort.value);
    this.long = this.calculationSecondsParameters(this.inputLong.value);

    this.totalTime = this[this.typeTimer];
  }

  saveParameters() {
    localStorage.setItem('pomodoroValue', JSON.stringify(this.calculationSecondsParameters(this.inputPomodoro.value)));
    localStorage.setItem('shortValue', JSON.stringify(this.calculationSecondsParameters(this.inputShort.value)));
    localStorage.setItem('longValue', JSON.stringify(this.calculationSecondsParameters(this.inputLong.value)));
  }

  closeModal() {
    this.modalSettings.close();
  }

  changeTextNotification(isError, text = null) {
    setTimeout(() => {
      if (isError) {
        this.notificationText.textContent = `${text.name}: ${text.message}`;
      } else {
        switch (this.typeTimer) {
          case 'pomodoro':
            this.notificationText.textContent = 'Time to work';
            break;

          case 'short':
            this.notificationText.textContent = 'Short rest';
            break;

          case 'long':
            this.notificationText.textContent = 'Long rest';
            break;

          default:
            break;
        }
      }
    }, 200);

    this.showNotification();
  }

  showNotification() {
    clearTimeout(this.notificationTimeout);

    this.notification.classList.remove('active');

    setTimeout(() => {
      this.notification.classList.add('active');

      this.notificationTimeout = setTimeout(() => {
        this.notification.classList.remove('active');
      }, this.NOTIFICATION_DURATION);
    }, 200);
  }

  changeVolumeNotificationSound() {
    this.audioNotification.volume = 0.5;
  }

  playNotificationSound() {
    this.changeVolumeNotificationSound();

    this.audioNotification.play();
  }

  removeClassActiveTimer() {
    this.btnsPomodoro.forEach((el) => {
      el.classList.remove('activeTimer');
    });
  }

  changeActiveButton(btn) {
    this.removeClassActiveTimer();

    btn.classList.add('activeTimer');
  }
}

new Pomodoro(25, 5, 15);
