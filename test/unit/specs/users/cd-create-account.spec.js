import vueUnitHelper from 'vue-unit-helper';
import BookingCreateAccountComponent from '!!vue-loader?inject!@/users/cd-create-account';

describe('Booking Create Account Form', () => {
  let MockUsersService;
  let MockUserUtils;
  let OrderStore;
  let BookingCreateAccountComponentWithMocks;

  beforeEach(() => {
    MockUsersService = {
      register: sinon.stub(),
    };
    MockUserUtils = {
      isUnderAge: sinon.stub(),
      getAge: sinon.stub(),
      profileToJSON: sinon.stub(),
    };
    OrderStore = {
      commit: sinon.stub(),
    };

    BookingCreateAccountComponentWithMocks = BookingCreateAccountComponent({
      '@/users/service': MockUsersService,
      '@/users/util': MockUserUtils,
      '@/events/order/order-store': OrderStore,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('computed', () => {
    it('should return an user based on profile', () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.userData = {
        firstName: 'ba',
      };
      vm.password = 'duh';
      vm.recaptchaResponse = 'stuff';
      vm.termsConditionsAccepted = true;
      vm.isSubscribedToMailingList = true;
      expect(vm.user).to.deep.equal({
        firstName: 'ba',
        password: 'duh',
        'g-recaptcha-response': 'stuff',
        termsConditionsAccepted: true,
        mailingList: true,
        emailSubject: 'Welcome to Zen, the CoderDojo community platform.',
        initUserType: {
          title: 'Parent/Guardian',
          name: 'parent-guardian',
        },
      });
    });
    it('should return if the user is underage', () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      MockUserUtils.isUnderAge.returns(true);
      vm.dob = '2017/03/01';
      const res = vm.isUnderage;
      expect(MockUserUtils.isUnderAge).to.have.been.calledWith(vm.dob);
      expect(res).to.be.true;
    });
  });
  describe('methods', () => {
    it('validateForm shoud validate every part of the form', async () => {
      // Order = dob, data, recaptcha
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.isUnderage = false;
      vm.$validator = {
        validateAll: sinon.stub().resolves(true),
      };
      vm.recaptchaResponse = true;
      const res = await vm.validateForm();
      expect(vm.$validator.validateAll).to.have.been.calledOnce;
      expect(res).to.be.true;
    });

    it('should return false on field failure', async () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.isUnderage = false;
      vm.$validator = {
        validateAll: sinon.stub().resolves(false),
      };
      vm.recaptchaResponse = true;
      const res = await vm.validateForm();
      expect(vm.$validator.validateAll).to.have.been.calledOnce;
      expect(res).to.be.false;
    });
    it('should return false and alert on recaptcha failure', async () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      const alerting = sinon.stub(window, 'alert');
      vm.isUnderage = false;
      vm.$validator = {
        validateAll: sinon.stub().resolves(true),
      };
      vm.recaptchaResponse = false;
      const res = await vm.validateForm();
      expect(vm.$validator.validateAll).to.not.have.been.called;
      expect(alerting).to.have.been.calledOnce;
      expect(res).to.be.false;
    });

    it('register the user account', async () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.validateForm = sinon.stub().resolves(true);
      MockUserUtils.profileToJSON = sinon.stub().returnsArg(0);
      vm.context = {
        country: {
          alpha2: 'FR',
        },
      };
      vm.dob = '2017/03/01';
      vm.user = { lastName: 'blu' };
      vm.userData = { firstName: 'bla' };
      vm.$ga = {
        event: sinon.stub(),
      };
      vm.$route = {
        name: 'Highway2L',
      };
      vm.$emit = sinon.stub();
      MockUserUtils.getAge.returns(24);

      await vm.register();

      expect(MockUserUtils.getAge).to.have.been.calledWith(sinon.match.date);
      expect(vm.$ga.event).to.have.been.calledWith(vm.$route.name, 'click', 'register_adult');
      expect(MockUsersService.register).to.have.been.calledWith(vm.user, { dob: '2017/03/01', country: { alpha2: 'FR' } });
      expect(vm.$emit).to.have.been.calledWith('registered');
      expect(OrderStore.commit).to.have.been.calledWith('setIsNewUser', true);
    });

    it('shoud differenciate the ga code for o13 registration', async () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.validateForm = sinon.stub().resolves(true);
      MockUserUtils.profileToJSON = sinon.stub().returnsArg(0);
      vm.context = {
        country: {
          alpha2: 'FR',
        },
      };
      vm.dob = '2017/03/01';
      vm.user = { lastName: 'blu' };
      vm.userData = { firstName: 'bla' };
      vm.$ga = {
        event: sinon.stub(),
      };
      vm.$route = {
        name: 'Highway2L',
      };
      vm.$emit = sinon.stub();
      MockUserUtils.getAge.returns(17);

      await vm.register();

      expect(MockUserUtils.getAge).to.have.been.calledWith(sinon.match.date);
      expect(vm.$ga.event).to.have.been.calledWith(vm.$route.name, 'click', 'register_kid');
      expect(MockUsersService.register).to.have.been.calledWith(vm.user, { dob: '2017/03/01', country: { alpha2: 'FR' } });
      expect(vm.$emit).to.have.been.calledWith('registered');
    });

    it('register should display an error on registration failure', async () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      const err = new Error('server crashed');
      const alerting = sinon.stub(window, 'alert');
      vm.validateForm = sinon.stub().resolves(true);
      MockUserUtils.profileToJSON = sinon.stub().returnsArg(0);
      MockUsersService.register.throws(err);
      vm.context = {
        country: {
          alpha2: 'FR',
        },
      };
      vm.dob = '2017/03/01';
      vm.user = { lastName: 'blu' };
      vm.userData = { firstName: 'bla' };
      vm.$ga = {
        event: sinon.stub(),
      };
      vm.$route = {
        name: 'Highway2L',
      };
      vm.$emit = sinon.stub();
      MockUserUtils.getAge.returns(17);

      await vm.register();

      expect(MockUserUtils.getAge).to.have.been.calledWith(sinon.match.date);
      expect(MockUsersService.register).to.have.been.calledWith(vm.user, { dob: '2017/03/01', country: { alpha2: 'FR' } });
      expect(vm.$ga.event).to.not.have.been.called;
      expect(vm.$emit).to.not.have.been.called;
      expect(alerting).to.have.been.calledOnce;
      expect(alerting).to.have.been.calledWith(err);
    });
    it('register should display nick-exists error on duplicate email', async () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      const err = new Error('nick-exists');
      vm.validateForm = sinon.stub().resolves(true);
      MockUserUtils.profileToJSON = sinon.stub().returnsArg(0);
      MockUsersService.register.throws(err);
      vm.context = {
        country: {
          alpha2: 'FR',
        },
      };
      vm.dob = '2017/03/01';
      vm.user = { lastName: 'blu' };
      vm.userData = { firstName: 'bla' };
      vm.$ga = {
        event: sinon.stub(),
      };
      vm.errors = {
        add: sinon.stub(),
      };
      vm.$route = {
        name: 'Highway2L',
      };
      vm.$emit = sinon.stub();
      MockUserUtils.getAge.returns(17);

      await vm.register();

      expect(MockUserUtils.getAge).to.have.been.calledWith(sinon.match.date);
      expect(MockUsersService.register).to.have.been.calledWith(vm.user, { dob: '2017/03/01', country: { alpha2: 'FR' } });
      expect(vm.$ga.event).to.not.have.been.called;
      expect(vm.$emit).to.not.have.been.called;
      expect(vm.errors.add).to.have.been.calledWith('registration', 'Nick exists', 'nick-exists');
    });
    it('onRecaptchaVerify should set the recaptcha response', () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.onRecaptchaVerify('dah');
      expect(vm.recaptchaResponse).to.equal('dah');
    });
    it('togglePasswordVisibility should toggle the password visibility', () => {
      const vm = vueUnitHelper(BookingCreateAccountComponentWithMocks);
      vm.isPasswordVisible = true;
      vm.togglePasswordVisibility();
      expect(vm.isPasswordVisible).to.be.false;
    });
  });
});
