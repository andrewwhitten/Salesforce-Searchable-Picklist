/**
 * Author:    Andrew Whitten
 * Created:   09.07.2024
 * 
 * Salesforce LWC ComboBox that allows for searching and selecting a picklist value inside a Flow.
 * 
 * Based on a code answer provided at: 
 * https://salesforce.stackexchange.com/questions/395758/searchable-lightning-combobox-lwc 
 * by https://salesforce.stackexchange.com/users/82956/anton-kutishevsky - Anton Kutishevsky
 * 
 **/

import { LightningElement, wire, api } from 'lwc';
import { getPicklistValues } from "lightning/uiObjectInfoApi";

// Replace this schema reference with the Object and Field that you want to get picklist values for
import LANGUAGE_FIELD from "@salesforce/schema/Language__c.Language__c";

export default class SearchablePicklistComboBox extends LightningElement {

    isListening = false;
    pickList;
    searchResults;
    selectedSearchResult;

    _labelText;
    _picklistValue;

    @api 
    get labelText() {

        if(!this._labelText) { return "No name specified" };

        return this._labelText;
    }

    set labelText(value) {
        this._labelText = value;
    }

    @api
    get picklistValue() {
        return this._picklistValue;
    }
    
    set picklistValue(value) {
        this._picklistValue = value;
    }
               
    get selectedValue() {
        return this.selectedSearchResult
                    ? this.selectedSearchResult.label
                    : null;
    }

    // TODO - set the selectedValue for editing existing records
    
    /** 
     * Set the picklist values
     * 
     * recordTypeId: Note that '012000000000000AAA' is the default record type value for all Salesforce orgs.
     * If you want a picklist associated with a different record type then you will need extra code
     * to retreive that at runtime.
     * 
     * fieldApiName: Use the import value at the top of this file
     */
    @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: LANGUAGE_FIELD }) picklistValues({data, error}) {
        
        if (data) {
            this.pickList = data.values;
        }
    }
     
    /**
     * 
     * @returns nothing
     */
    renderedCallback() {

        if (this.isListening) return;
        
        window.addEventListener("click", (event) => {
            this.hideDropdown(event);
        });
        
        this.isListening = true;
    }
        
    /** 
     * Note that when run inside a Flow the 'tagName' can be null. 
     * It still seems to run fine if we skip though. 
     * */
    hideDropdown(event) {

        if(this.template.host.tagName) {

            const cmpName = this.template.host.tagName;

            if(event.srcElement.tagName) {

                // Find the element clicked on the page
                const clickedElementSrcName = event.srcElement.tagName; 

                const isClickedOutside = cmpName !== clickedElementSrcName;

                if (this.searchResults && isClickedOutside) {
                    this.clearSearchResults();
                }
            }
        }
    }
        
    /** 
     * Filter the values to whatever text was entered - case insensitive 
     * */
    search(event) {

        const input = event.detail.value.toLowerCase();

        const result = this.pickList.filter((pickListOption) =>
            pickListOption.label.toLowerCase().includes(input));
        
        this.searchResults = result;
    }
    
    /** 
     * Set the selected value 
     * */
    selectSearchResult(event) {

        const selectedValue = event.currentTarget.dataset.value;
        
        // Picklists only consist of values, so not really needed
        this.selectedSearchResult = this.pickList.find(
            (pickListOption) => pickListOption.value === selectedValue
        );

        this.picklistValue = selectedValue;

        debugger;

        this.clearSearchResults();
    }
    
    /**
     * Clear the results
     * */
    clearSearchResults() {

        this.searchResults = null;
    }
    
    /**
     * Invoked when inputbox is focused
     */
    showPickListOptions() {
                
        if (!this.searchResults) {
            this.searchResults = this.pickList;
        }
    }
}