// State management for the application
const state = {
    currentStep: 1,
    packInfo: {
        name: '',
        description: '',
        creator: '',
        version: '1.0.0'
    },
    capes: [],
    viewMode: 'cape' // can be 'cape' or 'elytra'
};

export default state;

