class Pomodoro {
  constructor(pomodoro, short, long) {
    this.pomodoro = JSON.parse(localStorage.getItem('pomodoroValue')) ?? pomodoro * 60;
    this.short = JSON.parse(localStorage.getItem('shortValue')) ?? short * 60;
    this.long = JSON.parse(localStorage.getItem('longValue')) ?? long * 60;

    this.totalTime = this.pomodoro;
    this.seconds = 0;
    this.interval = null;
    this.typeTimer = 'pomodoro';
    this.numIterations = 0;
    this.circumference = 2 * Math.PI * 145;

    this.progressCircle = document.querySelector('.pomodoro__timer-progress');
    this.timer = document.querySelector('.pomodoro__timer');
    this.btnStart = document.querySelector('.functional__start');
    this.btnReset = document.querySelector('.functional__reset');
    this.form = document.querySelector('.form');
    this.inputPomodoro = document.getElementById('pomodoro');
    this.inputShort = document.getElementById('short');
    this.inputLong = document.getElementById('long');
    this.btnPomodoro = document.querySelector('.types-timers__pomodoro');
    this.btnShort = document.querySelector('.types-timers__short');
    this.btnLong = document.querySelector('.types-timers__long');
    this.innerTypesTimers = document.querySelector('.pomodoro__types-timers');
    this.notification = document.querySelector('.notification');
    this.notificationText = document.querySelector('.notification__text');

    this.btnsPomodoro = document.querySelectorAll('.pomodoro-btn');

    this.modalSettings = document.querySelector('#modalSettings');

    this.startListeners();
    this.updateSeconds('pomodoro');
  }

  startListeners() {
    this.btnStart.addEventListener('click', () => {
      const isClassActive = this.btnStart.classList.contains('active');

      if (isClassActive) {
        this.btnStart.classList.remove('active');
        this.stop();
      } else {
        this.btnStart.classList.add('active');
        this.start();
      }
    });

    this.btnReset.addEventListener('click', () => {
      this.progressCircle.style.strokeDashoffset = 0;

      this.updateSeconds('pomodoro');
      this.stop();
      this.changeActiveButton(this.btnPomodoro);

      this.btnStart.classList.remove('active');
    });

    this.modalSettings.addEventListener('click', (e) => {
      const isTargetWrap = e.target.closest('.settings__wrap') === null;

      if (isTargetWrap) {
        this.closeModal();
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isInputsValue = this.inputPomodoro.value < 1 || this.inputShort.value < 1 || this.inputLong.value < 1;

      try {
        if (isInputsValue) {
          throw new Error('Incorrect number');
        }

        this.saveParameters();
        this.updateParameters();
        this.updateSeconds('pomodoro');
        this.changeActiveButton(this.btnPomodoro);
        this.renderTimer();
        this.stop();
        this.closeModal();

        this.btnStart.classList.remove('active');
        this.progressCircle.style.strokeDashoffset = 0;
      } catch (err) {
        this.showNotification(err);

        this.closeModal();
      }
    });

    this.innerTypesTimers.addEventListener('click', (e) => {
      const isNoInnerTypesTimers = e.target !== this.innerTypesTimers;

      switch (e.target) {
        case this.btnPomodoro:
          this.changeActiveButton(this.btnPomodoro, 'pomodoro', true);
          break;
        case this.btnShort:
          this.changeActiveButton(this.btnShort, 'short', true);
          break;
        case this.btnLong:
          this.changeActiveButton(this.btnLong, 'long', true);
          break;
      }

      if (isNoInnerTypesTimers) {
        this.progressCircle.style.strokeDashoffset = 0;
        this.stop();
        this.btnStart.classList.remove('active');
      }
    });
  }

  start() {
    this.interval = setInterval(() => {
      if (this.seconds === 0) {
        this.renderTimer();

        this.switchTimer(this.typeTimer);
      } else {
        this.seconds = --this.seconds;

        this.renderTimer();
      }

      const offset = this.circumference - (this.seconds / this.totalTime) * this.circumference;
      this.progressCircle.style.strokeDashoffset = offset;
    }, 1000);
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
    switch (type) {
      case 'pomodoro':
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

        break;
      case 'short':
        this.seconds = this.pomodoro;
        this.typeTimer = 'pomodoro';
        this.totalTime = this.pomodoro;

        break;
      case 'long':
        this.seconds = this.pomodoro;
        this.typeTimer = 'pomodoro';
        this.totalTime = this.pomodoro;

        break;
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

  updateSeconds(type) {
    this.typeTimer = type;
    this.numIterations = 0;
    this.seconds = this[type];

    this.renderTimer();
  }

  calculationSecondsParameters(type) {
    const result = type > 60 ? 60 * 60 : type * 60;

    return result;
  }

  updateParameters() {
    this.pomodoro = this.calculationSecondsParameters(this.inputPomodoro.value);
    this.short = this.calculationSecondsParameters(this.inputShort.value);
    this.long = this.calculationSecondsParameters(this.inputLong.value);
  }

  saveParameters() {
    localStorage.setItem('pomodoroValue', JSON.stringify(this.calculationSecondsParameters(this.inputPomodoro.value)));
    localStorage.setItem('shortValue', JSON.stringify(this.calculationSecondsParameters(this.inputShort.value)));
    localStorage.setItem('longValue', JSON.stringify(this.calculationSecondsParameters(this.inputLong.value)));
  }

  closeModal() {
    this.modalSettings.close();
  }

  showNotification(err) {
    this.notificationText.textContent = `${err.name}: ${err.message}`;

    this.notification.classList.remove('active');
    this.notification.classList.add('active');

    setTimeout(() => {
      this.notification.classList.remove('active');
    }, 3000);
  }

  removeClassActiveTimer() {
    this.btnsPomodoro.forEach((el) => {
      el.classList.remove('activeTimer');
    });
  }

  changeActiveButton(btn, typeTimer = null, click = false) {
    this.removeClassActiveTimer();

    btn.classList.add('activeTimer');

    if (click) {
      this.totalTime = this[typeTimer];
      this.updateSeconds(typeTimer);
    }
  }
}

new Pomodoro(25, 5, 15);
