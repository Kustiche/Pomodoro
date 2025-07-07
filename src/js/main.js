class Pomodoro {
  constructor(pomodoro, short, long) {
    this.pomodoro = JSON.parse(localStorage.getItem('pomodoroValue')) ?? pomodoro;
    this.short = JSON.parse(localStorage.getItem('shortValue')) ?? short;
    this.long = JSON.parse(localStorage.getItem('longValue')) ?? long;

    this.minutes = 0;
    this.seconds = 0;
    this.interval = null;
    this.typeTimer = 'pomodoro';
    this.numIterations = 0;
    this.numShiftsTimers = 0;

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
    this.updateMinutes('pomodoro');
  }

  startListeners() {
    this.btnStart.addEventListener('click', () => {
      const isClassActive = !this.btnStart.classList.contains('active');

      if (isClassActive) {
        this.btnStart.classList.add('active');

        this.start();
      } else {
        this.btnStart.classList.remove('active');

        this.stop();
      }
    });

    this.btnReset.addEventListener('click', () => {
      this.updateMinutes('pomodoro');
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

        this.saveValuesInputs();
        this.updateParameters();
        this.updateMinutes('pomodoro');
        this.renderTimer();
        this.stop();
        this.closeModal();

        this.btnStart.classList.remove('active');
      } catch (err) {
        this.showNotification(err);

        this.closeModal();
      }
    });

    this.innerTypesTimers.addEventListener('click', (e) => {
      const isBtnPomodoro = e.target === this.btnPomodoro && e.target.textContent.toLowerCase() !== this.typeTimer;
      const isBtnShort = e.target === this.btnShort && e.target.textContent.toLowerCase() !== this.typeTimer;
      const isBtnLong = e.target === this.btnLong && e.target.textContent.toLowerCase() !== this.typeTimer;

      if (isBtnPomodoro) {
        this.changeActiveButton(this.btnPomodoro, 'pomodoro', true);
      } else if (isBtnShort) {
        this.changeActiveButton(this.btnShort, 'short', true);
      } else if (isBtnLong) {
        this.changeActiveButton(this.btnLong, 'pomodoro', true);
      }

      this.stop();
      this.btnStart.classList.remove('active');
    });
  }

  start() {
    this.interval = setInterval(() => {
      if (this.seconds === 0 && this.minutes !== 0) {
        this.minutes = --this.minutes;
        this.seconds = 59;

        this.renderTimer();
      } else if (this.seconds !== 0) {
        this.seconds = --this.seconds;

        this.renderTimer();
      } else if (this.minutes === 0 && this.seconds === 0) {
        this.renderTimer();

        this.switchTimer(this.typeTimer);
      }
    }, 1000);
  }

  renderTimer() {
    const minutes = this.minutes >= 10 ? this.minutes : `0${this.minutes}`;
    const seconds = this.seconds >= 10 ? this.seconds : `0${this.seconds}`;

    this.timer.textContent = `${minutes}:${seconds}`;
  }

  switchTimer(type) {
    switch (type) {
      case 'pomodoro':
        if (this.numIterations === 3) {
          this.typeTimer = 'long';
          this.minutes = this.long;
        } else if (this.numShiftsTimers === 0) {
          this.typeTimer = 'short';
          this.minutes = this.short;

          ++this.numShiftsTimers;
        } else if (this.numShiftsTimers === 1) {
          this.typeTimer = 'pomodoro';
          this.minutes = this.pomodoro;

          --this.numShiftsTimers;
        } else if (this.numShiftsTimers === 2) {
          this.numShiftsTimers = 0;

          ++this.numIterations;
        }

        break;
      case 'short':
        if (this.numShiftsTimers === 0) {
          this.typeTimer = 'short';
          this.minutes = this.short;

          ++this.numShiftsTimers;
        } else if (this.numShiftsTimers === 2) {
          this.typeTimer = 'short';
          this.minutes = this.short;

          --this.numShiftsTimers;
        } else {
          this.typeTimer = 'pomodoro';
          this.minutes = this.pomodoro;

          this.numShiftsTimers = 2;
        }

        break;
      case 'long':
        this.typeTimer = 'pomodoro';
        this.minutes = this.pomodoro;
        this.numIterations = 0;
        this.numShiftsTimers = 0;

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

  updateMinutes(type) {
    this.typeTimer = type;
    this.numIterations = 0;
    this.seconds = 0;

    if (type === 'pomodoro') {
      this.minutes = this.pomodoro;
    } else if (type === 'short') {
      this.minutes = this.short;
    } else if (type === 'long') {
      this.minutes = this.long;
    }

    this.renderTimer();
  }

  updateParameters() {
    this.pomodoro = this.inputPomodoro.value > 999 ? 999 : this.inputPomodoro.value;
    this.short = this.inputShort.value > 999 ? 999 : this.inputShort.value;
    this.long = this.inputLong.value > 999 ? 999 : this.inputLong.value;
  }

  saveValuesInputs() {
    localStorage.setItem('pomodoroValue', JSON.stringify(this.inputPomodoro.value > 999 ? 999 : this.inputPomodoro.value));
    localStorage.setItem('shortValue', JSON.stringify(this.inputShort.value > 999 ? 999 : this.inputShort.value));
    localStorage.setItem('longValue', JSON.stringify(this.inputLong.value > 999 ? 999 : this.inputLong.value));
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

  changeActiveButton(btn, typeTimer = null, click = false) {
    this.removeClassActiveTimer();

    btn.classList.add('activeTimer');

    if (click) {
      this.switchTimer(typeTimer);
      this.updateMinutes(typeTimer);
    }
  }

  removeClassActiveTimer() {
    this.btnsPomodoro.forEach((el) => {
      el.classList.remove('activeTimer');
    });
  }
}

new Pomodoro(25, 5, 15);
