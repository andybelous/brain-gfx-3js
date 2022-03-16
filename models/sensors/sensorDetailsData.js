var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//brands Schema
var sensorDetailsDataSchema = new Schema({
    sensor_id: {
        type: Schema.Types.ObjectId,
        ref: 'sensorsDatamodels'
    },
    account_id: {
        type: String,
        required: true
    },
    organization_id: {
        type: Schema.Types.ObjectId,
        ref: 'organizatioDatamodels'
    },
    event_id: {
        type: String
    },
    team_id: {
        type: Schema.Types.ObjectId,
        ref: 'teamsDatamodels'
    },
    institution_id: {
        type: Schema.Types.ObjectId,
        ref: 'institutionsDatamodels'
    },
    player_id: {
        type: Schema.Types.ObjectId,
        ref: 'playersDatamodels'
    },
    family_id: {
        type: String,
    },
    players: {
        type: Object,
        required: true
    },
    impact_date: {
        type: String,
    },
    impact_time: {
        type: String,
    },
    impact_id: {
        type: String,
        required: true
    },
    impact_sensor: {
        type: String,
        required: true
    },
    simulation: {
        type: Object,
        required: true
    },
    simulation_status: {
        type: String,
        required: true
    },
    bucket_name: {
        type: String,
        required: true
    },
    computed_time: {
        type: String,
        required: true
    },
    job_id: {
        type: String,
        required: true
    },
    log_stream_name: {
        type: String,
    },
    root_path: {
        type: String,
        required: true
    },
    sideline_video_details: {
        type: Object,
        required: true
    },
    submitted_user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    instance_type: {
        type: String,
        default: null
    },
    jwtToken: {
        type: String,
        default: null
    },
    simulationCheck: {
        type: String,
        default: null,
        index: true,
    },

  /*  secret : {
        type: String,
        required: true
    },
    token : {
        type: String,
        required: true
    },*/
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
    job_started_at: {
        type: Date,
        default: null
    },
    diagnosed_concussion: {
        type: Boolean,
        default: false
    }
});
sensorDetailsDataSchema.index({
    simulation_status: 1
});
sensorDetailsDataSchema.index({
    team_id: 1,
});
sensorDetailsDataSchema.index({
    organization_id: 1,
});
sensorDetailsDataSchema.index({
    institution_id: 1,
});
sensorDetailsDataSchema.index({ simulationCheck: 1 })
var collectionName = 'sensor_details'
module.exports = mongoose.model('sensor_details', sensorDetailsDataSchema, collectionName);