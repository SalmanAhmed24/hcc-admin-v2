import React, { useState } from 'react';
import Select from 'react-select'; 
import debounce from 'lodash.debounce'; 
import axios from 'axios';

const ZipcodeDropdown = () => {
    // const [options, setOptions] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);

    const [zipCodeLoader, setZipCodeLoader] = useState(false);
    const [zipCodeOpt, setZipCodeOpt] = useState([]);

    // Fetch data from the Express backend
    const fetchOptions = async (inputValue) => {
        setZipCodeLoader(true);
    axios
      .get(`${apiPath.prodPath}/api/picklist/zipcodes/getzipcodes?search=${inputValue}&limit=50`)
      .then((res) => {
        console.log(res.data);
        res.data.zipCodes.map((i) => {
          console.log("##", i.zipCode);
        });
        const sortedData = res.data.zipCodes.map((i) => {
          return {
            label: i.zipCode,
            value: i.zipCode,
          };
        });
        setZipCodeOpt(sortedData);
        setZipCodeLoader(false);
      })
      .catch((err) => {
        console.log(err);
        setZipCodeLoader(false);
      });

    };

    // Debounce the fetch function to limit the number of API calls
    const debouncedFetch = debounce((inputValue) => {
        if (inputValue.length > 0) {
            fetchOptions(inputValue);
        } else {
          setZipCodeOpt([]); // Clear options if input is empty
        }
    }, 300);

    // Handle input changes
    const handleInputChange = (inputValue) => {
        debouncedFetch(inputValue); // Trigger debounced fetch
    };

    return (
        <Select
            options={zipCodeOpt}
            onInputChange={handleInputChange}
            isLoading={zipCodeLoader}
            placeholder="Search Zip Codes"
            noOptionsMessage={() => 'No zip codes found'}
        />
    );
};

export default ZipcodeDropdown;
