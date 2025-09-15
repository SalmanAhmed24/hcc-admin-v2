 import React from 'react'
 
 const ClientBasicInfo = ({ item, open }) => {
   return (
     <>
     <div className="flex flex-wrap flex-row gap-10 justify-start ml-14">
           <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Company/Client Name</label>
              <p className="font-satoshi text-md">{item.clientName}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Primary Contact Name</label>
              <p className="font-satoshi text-md">
                {item.secondName == "" ? "N/A" : item.primaryContact}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Email</label>
              <p className="font-satoshi text-md">{item.email}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Website</label>
              <p className="font-satoshi text-md">{item.websiteAddress}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Phone</label>
              <p className="font-satoshi text-md">{item.phone == "" ? "N/A" : item.phone}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Cell</label>
              <p className="font-satoshi text-md">{item.cell == "" ? "N/A" : item.cell}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Address 1</label>
              <p className="font-satoshi text-md">
                {item.address1 == "" ? "N/A" : item.address1}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Address 2</label>
              <p className="font-satoshi text-md">
                {item.address2 == "" ? "N/A" : item.address2}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Zip Code</label>
              <p className="font-satoshi text-md">
                {item.zipCode == "" ? "N/A" : item.zipCode}
              </p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">City</label>
              <p className="font-satoshi text-md">{item.city == "" ? "N/A" : item.city}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">State</label>
              <p className="font-satoshi text-md">{item.state == "" ? "N/A" : item.state}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Fax #</label>
              <p className="font-satoshi text-md">{item.fax}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Territory</label>
              <p className="font-satoshi text-md">{item.territory}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Territory Manager</label>
              <p className="font-satoshi text-md">{item.territoryManager}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Assigned To</label>
              <p className="font-satoshi text-md">{item.assignedTo}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Assigned By</label>
              <p className="font-satoshi text-md">{item.assignee}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Lead Status</label>
              <p className="font-satoshi text-md">{item.leadStatus}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Client Need Category</label>
              <p className="font-satoshi text-md">{item.needCategory.categoryName + " " + item.needCategory.categoryCode}</p>
            </div>
            <div className="w-1/4 flex flex-col gap-2">
              <label className="font-satoshi font-semibold text-xl">Client Need Sub-Category</label>
              <p className="font-satoshi text-md">{item.needCategory.subCategory.subCategoryName + " " + item.needCategory.subCategory.subCategoryCode}</p>
            </div>
     </div>
      
     </>
   )
 }
 
 export default ClientBasicInfo
 
 
 
 
 
 
 
 