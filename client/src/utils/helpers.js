import axios from "axios";

export const athleteFormHasErrors = async (athlete) => {
	const errors = [];
  
	//name - (No symbol allowed, so no ;DROP TABLE, OR 1=1)
	if(!(/^[A-Za-z\s-]+$/.test(athlete.name))) {
	  	errors.push("Name cannot contain number or symbol");
	}
  
	//height 
	if (/^0$/.test(athlete.height)) {
	  	errors.push("Height cannot be 0");
	} else if(!(/^[1-9][0-9]*$/.test(athlete.height))) {
	  	errors.push("Height is not a valid number, no symbol or letters are allowed");
	}
	
	//weight
	if (/^0$/.test(athlete.weight)) {
	  	errors.push("Weight cannot be 0");
	} else if(!(/^[1-9][0-9]*$/.test(athlete.weight))) {
	  	errors.push("Weight is not a valid number, no symbol or letters are allowed");
	}
  
	//phone number - check unique
	if(!(/^[1-9][0-9]{9}$/.test(athlete.phone_number))) {
		errors.push("Phone Number needs to be 10 digits long and without - or ()");
	} else { // is valid numeric wise but check in database
		try {
			const res = await axios.post("http://localhost:65535/phone-exists/", { person_id: athlete.person_id, phone_number: athlete.phone_number });
			if (res.data.exists) {
				errors.push("Phone Number is already taken");
			}
		} catch (err) {
			console.error(err);
		}
	}
  
	//email
	if(!(/^[0-9a-zA-Z._]+@([a-zA-Z]+\.)+[a-zA-Z]{2,4}$/.test(athlete.email))) {
	  	errors.push("Invalid email format, only roman alphabet, numbers, . and _ are allowed.");
	} else { // is valid format wise but check in database
		try {
			const response = await axios.post("http://localhost:65535/email-exists", { person_id: athlete.person_id, email: athlete.email });
			if (response.data.exists) {
				errors.push("Email is already taken");
			}
		} catch (err) {
			console.error(err);
		}
	}
  
	//address
	if(!(/^\d+(-\d+)?\s([A-Z][a-z]*\s)+(St|Street|Rd|Road|Dr|Drive|Lane|Way|Blvd|Boulevard|Ave|Avenue)[,.-]\s[A-Z][a-z]*$/.test(athlete.address))) {
	  	errors.push("Invalid address format, no symbol except , and . are allowed.");
	}
  
	//salary
	if(!(/^[1-9][0-9]*$/.test(athlete.salary))) {
		errors.push("Salary is not a number");
	}
  
	return errors;
};

export const sponsorsFormHasErrors = (formData) => {
	const nameFilled = formData.name !== "default" && formData.nameVal !== "";
	const emailFilled = formData.email !== "default" && formData.emailVal !== "";
	const moneyFilled = formData.money !== "default" && formData.moneyVal !== "";
	const andor1Filled = formData.andor1 !== "default";
	const andor2Filled = formData.andor2 !== "default";

	const errors = []

	if (!(/^[A-Za-z\s-]*$/.test(formData.nameVal))) {
		errors.push("Name has invalid symbols");
	}

	if (!(/^[A-Za-z\s-]*$/.test(formData.emailVal))) {
		errors.push("Email has invalid symbols");
	}

	if (!(/^[1-9][0-9]*$|^$/.test(formData.moneyVal))) {
		errors.push("Money is not a valid number, no symbol or letters are allowed");
	}
	
	if (formData.name !== "default" && formData.nameVal === "") {
		errors.push("Please enter a name or remove the filter");
	}
	if (formData.email !== "default" && formData.emailVal === "") {
		errors.push("Please enter a email or remove the filter");
	}
	if (formData.money !== "default" && formData.moneyVal === "") {
		errors.push("Please enter a money amount or remove the filter");
	}

	if (nameFilled && !andor1Filled && emailFilled && andor2Filled && moneyFilled) {
		errors.push("Please select AND/OR for email or remove name inputs");
	}

	return errors;
};

export const generateSponsorFormWhereClause = (formData) => {
	const nameFilled = formData.name !== "default" && formData.nameVal !== "";
	const emailFilled = formData.email !== "default" && formData.emailVal !== "";
	const moneyFilled = formData.money !== "default" && formData.moneyVal !== "";
	const andor1Filled = formData.andor1 !== "default";
	const andor2Filled = formData.andor2 !== "default";

	let whereClause = "";

	if (nameFilled && !emailFilled && !moneyFilled) {
		whereClause = `${formData.name} '${formData.nameVal}'`;
	}
	if (!nameFilled && emailFilled && !moneyFilled) {
		whereClause = `${formData.email} '${formData.emailVal}'`;
	}	
	if (!nameFilled && !emailFilled && moneyFilled) {
		whereClause = `${formData.money} ${formData.moneyVal}`;
	}
	if (nameFilled && andor1Filled && emailFilled && !andor2Filled) {
		whereClause = `${formData.name} '${formData.nameVal}' ${formData.andor1} ${formData.email} '${formData.emailVal}'`;	
	}
	
	if (nameFilled && !andor1Filled && !emailFilled && andor2Filled && moneyFilled) {
		whereClause = `${formData.name} '${formData.nameVal}' ${formData.andor2} ${formData.money} ${formData.moneyVal}`;
	}
	if (!nameFilled && !andor1Filled && emailFilled && andor2Filled && moneyFilled) {
		whereClause = `${formData.email} '${formData.emailVal}' ${formData.andor2} ${formData.money} ${formData.moneyVal}`;
	}
	if (nameFilled && andor1Filled && emailFilled && andor2Filled && moneyFilled) {
		whereClause = `${formData.name} '${formData.nameVal}' ${formData.andor1} ${formData.email} '${formData.emailVal}' ${formData.andor2} ${formData.money} ${formData.moneyVal}`;	
	}

	return whereClause;
};