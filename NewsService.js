"use strict"

var PersistenceStore = require('./PersistenceStore');

const INVALID_ARGUMENT = "InvalidArgument";
const INVALID_KEY = 'InvalidKey';
const NEWS_STORY_NOT_FOUND = 'NewsStoryNotFound';


var NewsService = function() {

    /**
     * Below code adds a news story to the persistencestore and returns an id generated by the persistence store
     * to uniquely identify this story.
     */
    NewsService.prototype.addStory = function(title, content, author, isPublic, date) {
        if(!validateString(title) ) {
            throw new Error(INVALID_ARGUMENT + " - title");
        } else if( !validateString(content)) {
            throw new Error(INVALID_ARGUMENT + " - content");
        } else if( !validateString(author)) {
            throw new Error(INVALID_ARGUMENT + " - author");
        } else if( !validateBoolean(isPublic)) {
            throw new Error(INVALID_ARGUMENT + " - isPublic Flag");
        } else if(!validateDate(date)) {
            throw new Error(INVALID_ARGUMENT + " - date: " + date);
        } 
        console.log("Adding News Story: Title: " + title + " Author: " + author);
        var id = PersistenceStore.getPersistenceStoreInstance().addStory(title, content, author, isPublic, date);
        return id;
    }

    /**
     * Below code updates the title of the news story for the given id.
     */
    NewsService.prototype.updateTitle = function(id, newtitle) {
        if(isNaN(id) || !validateString(newtitle)){
            throw new Error(INVALID_ARGUMENT + " - title");
        }
        try {
            console.log("Updating Title for News Story, ID: " + id);
            PersistenceStore.getPersistenceStoreInstance().updateTitle(id, newtitle);
        } catch(err) {
            console.log(err)
            if(err.message.includes(INVALID_KEY)) {
                throw new Error(NEWS_STORY_NOT_FOUND);
            } else {
                throw err;
            }
        }
    }

    /**
     * Below code updates the content of the news story for the given id.
     */
    NewsService.prototype.updateContent = function(id, newContent) {
        if(isNaN(id) || !validateString(newContent)){
            throw new Error(INVALID_ARGUMENT + " - content");
        }
        try {
            console.log("Updating Content for News Story, ID: " + id);
            PersistenceStore.getPersistenceStoreInstance().updateContent(id, newContent);
        } catch(err) {
            console.log(err)
            if(err.message.includes(INVALID_KEY)) {
                throw new Error(NEWS_STORY_NOT_FOUND);
            } else {
                throw err;
            }
        }
    }

    /**
     * Below code deletes the story for the given id.
     * If id does not exists nothing is done. 
     */
    NewsService.prototype.deleteStory = function(id) {
        if(isNaN(id)){
            throw new Error(INVALID_ARGUMENT + " - ID should be a number");
        }
        console.log("Deleting News Story, ID: " + id);
        try {
            PersistenceStore.getPersistenceStoreInstance().deleteStory(id);
        } catch(err) {
            console.log(err)
            if(err.message.includes(INVALID_KEY)) {
                throw new Error(NEWS_STORY_NOT_FOUND);
            } else {
                throw err;
            }
        }
    }

    /**
     * Below code returns the news stories which match the fiven filter object.
     * if filter object is empty all stories are returned.
     * filter can have arguments, title, author dateRange {'startDate', 'endDate'}, id based on which stories can be filtered.
     */
    NewsService.prototype.getStoriesForFilter = function(filter) {
        if(filter == undefined) {
            throw new Error(INVALID_ARGUMENT + " - filter is undefined");
        }
        try {
            console.log("Fetching News Stories based on Filter");
            return PersistenceStore.getPersistenceStoreInstance().getStoriesForFilter(filter);
        } catch(err) {
            console.log(err)
            throw err;
        }
    }
}


// Below section is for input validation



function validateBoolean(val) {
    return (typeof val === "boolean");
}
function validateString(str) {
    return (typeof str === 'string' || str instanceof String) && (str != '');
}

function validateDate(date) {
    try {
        new Date(date).getTime();
    } catch(err){
        return false;
    }
    return true;
    
}

module.exports = NewsService;
