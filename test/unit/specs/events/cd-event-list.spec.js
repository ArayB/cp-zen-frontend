import Vue from 'vue';
import eventList from '!!vue-loader?inject!@/events/cd-event-list';

describe('Event list component', () => {
  function setUpEventListComponentWithMockEvents(mockEventsBody) {
    const mockService = {
      loadEvents: (/* dojoId */) => Promise.resolve({ body: mockEventsBody }),
    };
    const eventListWithMocks = eventList({
      './service': mockService,
    });
    return eventListWithMocks;
  }

  it('should show the list of dojo events', (done) => {
    const mockEventDataResponse = [
      {
        id: 'd206004a-b0ce-4267-bf07-133e8113aa1b',
        name: 'My First Amazing Event',
        dojoId: '3ed47c6d-a689-46a0-883b-1f3fd46e9c77',
        dates: [
          {
            startTime: '2017-06-06T16:30:00.000Z',
            endTime: '2017-06-06T18:00:00.000Z',
          },
        ],
      },
      {
        id: '34174952-8ca4-4189-b8cb-d383e3fde992',
        name: 'My Second Amazing Event',
        dojoId: '3ed47c6d-a689-46a0-883b-1f3fd46e9c77',
        dates: [
          {
            startTime: '2017-06-06T16:30:00.000Z',
            endTime: '2017-06-06T18:00:00.000Z',
          },
        ],
      },
    ];

    const EventListWithMock = setUpEventListComponentWithMockEvents(mockEventDataResponse);
    const vm = new Vue(EventListWithMock);
    vm.dojoId = '3ed47c6d-a689-46a0-883b-1f3fd46e9c77';
    vm.loadEvents();
    requestAnimationFrame(() => {
      expect(vm.events).to.deep.equal(mockEventDataResponse);
      done();
    });
  });
});