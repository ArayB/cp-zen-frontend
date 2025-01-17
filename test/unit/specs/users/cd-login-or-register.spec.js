import vueUnitHelper from 'vue-unit-helper';
import LoginOrRegisterComponent from '@/users/cd-login-or-register';

describe('Login or register', () => {
  let vm;

  beforeEach(() => {
    vm = vueUnitHelper(LoginOrRegisterComponent);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('checkIsLoggedIn', () => {
    it('should call next if user is logged in', () => {
      // ARRANGE
      sinon.stub(vm, 'next');
      vm.isLoggedIn = true;

      // ACT
      vm.checkIsLoggedIn();

      // ASSERT
      expect(vm.next).to.have.been.calledOnce;
    });

    it('should not call next if user is not logged in', () => {
      // ARRANGE
      sinon.stub(vm, 'next');
      vm.isLoggedIn = false;

      // ACT
      vm.checkIsLoggedIn();

      // ASSERT
      expect(vm.next).to.not.have.been.called;
    });
  });

  describe('next', () => {
    it('should go to the next step', () => {
      vm.$router = {
        push: sinon.stub(),
      };
      vm.eventDetails = {
        bananas: 1,
      };
      vm.next();
      expect(vm.$router.push).to.have.been.calledWith({ name: 'EventSessions', params: { eventId: vm.eventId } });
    });
  });

  describe('computed', () => {
    it('redirectionUrl', () => {
      vm.$route = {
        path: 'somewhere',
      };
      expect(vm.redirectionUrl).to.equal('somewhere');
    });

    it('context', () => {
      vm.dojo = {
        country: {
          alpha2: 'FR',
        },
      };
      expect(vm.context).to.deep.equal({ country: { alpha2: 'FR' } });
    });
  });

  describe('created', () => {
    it('should call checkIsLoggedIn', () => {
      // ARRANGE
      sinon.stub(vm, 'checkIsLoggedIn');

      // ACT
      vm.$lifecycleMethods.created();

      // ASSERT
      expect(vm.checkIsLoggedIn).to.have.been.calledOnce;
    });
  });
});
