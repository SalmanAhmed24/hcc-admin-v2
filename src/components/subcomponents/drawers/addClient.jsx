import Drawer from "@mui/material/Drawer";
import "./style.scss";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { apiPath } from "@/utils/routes";
import CloseIcon from "@mui/icons-material/Close";
import debounce from "lodash.debounce";
import Swal from "sweetalert2";
import moment from "moment";
import { ToggleButtonGroup, ToggleButton, Typography, Box } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * toUserOption — converts a raw User document from /api/users/allusers into
 * a react-select option that carries the _id as `value`.
 *
 * CHANGED vs old code:
 *   Old: { label: "John Smith", value: "John Smith" }
 *         ↑ full name string sent to backend — broke on name changes
 *
 *   New: { label: "John Smith", value: "64abc...objectId", userId: "64abc..." }
 *         ↑ _id sent to backend as assignedToId / assigneeId / territoryManagerId
 *
 * The `label` is still the display name — nothing changes visually.
 * The `userId` field is a convenience alias so callers can do option.userId
 * instead of option.value when the intent is clearer.
 */
function toUserOption(user) {
  const fullName = `${user.firstName} ${user.secondName}`.trim();
  return {
    label:  fullName,
    value:  user._id,      // ObjectId string — this is what gets sent to the backend
    userId: user._id,      // alias for readability at call sites
  };
}

/**
 * toEditUserOption — rebuilds a react-select option when pre-filling edit mode.
 *
 * CHANGED vs old code:
 *   Old: { label: editData.assignedTo, value: editData.assignedTo }
 *        → value was a name string, couldn't be sent back as an id
 *
 *   New: editData.assignedTo is now { id: ObjectId, name: "John Smith" }
 *        → { label: "John Smith", value: "64abc...objectId" }
 *
 * Falls back to null (empty select) when the field is unset on the record.
 */
function toEditUserOption(userRef) {
  // userRef shape from the new model: { id: string|null, name: string|null }
  if (!userRef?.id) return null;
  return {
    label:  userRef.name  || "Unknown",
    value:  userRef.id,
    userId: userRef.id,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function AddCLient({ open, handleClose, addEmp, edit, editData, editEmp }) {
  // ── Plain string fields (unchanged) ────────────────────────────────────────
  const [clientName,      setClientName]      = useState("");
  const [primaryContact,  setPrimaryContact]  = useState("");
  const [email,           setEmail]           = useState("");
  const [phone,           setPhone]           = useState("");
  const [fax,             setFax]             = useState("");
  const [address1,        setAddress1]        = useState("");
  const [address2,        setAddress2]        = useState("");
  const [state,           setState]           = useState("");
  const [websiteAddress,  setWebsiteAddress]  = useState("");
  const [busRegDate,      setBusRegDate]      = useState("");
  const [researchPriority, setResearchPriority] = useState("");
  const [researchTag,     setResearchTag]     = useState(false);

  // ── Select fields (plain — unchanged) ──────────────────────────────────────
  const [status,          setStatus]          = useState(null);
  const [statusOpt,       setStatusOpt]       = useState([]);
  const [inputStatusValue, setInputStatusValue] = useState("");

  const [territory,       setTerritory]       = useState(null);
  const [territoryOpt,    setTerritoryOpt]    = useState([]);
  const [inputTerritoryValue, setInputTerritoryValue] = useState("");

  const [zipCode,         setZipCode]         = useState(null);
  const [zipCodeOpt,      setZipCodeOpt]      = useState([]);
  const [zipCodeLoader,   setZipCodeLoader]   = useState(false);
  const [inputValue,      setInputValue]      = useState("");

  const [city,            setCity]            = useState(null);
  const [cityOpt,         setCityOpt]         = useState([]);
  const [inputValueCity,  setInputValueCity]  = useState("");

  const [needCategory,    setNeedCategory]    = useState(null);
  const [needCatgoryOpt,  setNeedCatgoryOpt]  = useState([]);
  const [inputNeedCategory, setInputNeedCategory] = useState("");
  const [needCategoryName,  setNeedCategoryName]  = useState("");
  const [needCategoryCode,  setNeedCategoryCode]  = useState("");

  const [needSubCategory,    setNeedSubCategory]    = useState(null);
  const [needSubCategoryOpt, setNeedSubCategoryOpt] = useState([]);
  const [inputNeedSub,       setInputNeedSub]       = useState("");
  const [needSubCategoryName, setNeedSubCategoryName] = useState("");
  const [needSubCategoryCode, setNeedSubCategoryCode] = useState("");

  const [leadStatus,      setLeadStatus]      = useState(null);
  const [leadStatusOpt,   setLeadStatusOpt]   = useState([]);
  const [inputLeadStatusValue, setInputLeadStatusValue] = useState("");

  // ── User ref select fields (CHANGED) ───────────────────────────────────────
  // These three hold react-select option objects whose .value is the user _id.
  // Previously they held objects whose .value was a full name / username string.
  //
  // State name kept the same so the JSX below is minimal-diff.
  // The option objects themselves changed shape — see toUserOption() above.
  const [empOpt,           setEmpOpt]           = useState([]);  // shared options list

  const [territoryManager, setTerritoryManager] = useState(null);
  const [inputTerritoryManager, setInputTerritoryManager] = useState("");

  const [assignedTo,      setAssignedTo]      = useState(null);
  const [inputAssignedTo, setInputAssignedTo] = useState("");

  // "Assigned By" maps to the `assignee` field on the model.
  // The label says "Assigned By" in the UI — keeping the state name assignedBy
  // to avoid renaming every JSX reference, but what gets sent is `assigneeId`.
  const [assignedBy,      setAssignedBy]      = useState(null);
  const [inputAssignedBy, setInputAssignedBy] = useState("");

  // ── Research toggle ─────────────────────────────────────────────────────────
  const handleChange = (event, newValue) => {
    if (newValue !== null) setResearchTag(newValue);
  };

  // ── Data fetching ───────────────────────────────────────────────────────────

  const getNeedCategory = async () => {
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/picklist/needCategory/getAllNeedCategory`);
      const options = res.data.needCategory.map((item) => ({
        label:        item.categoryName,
        value:        item.categoryName,
        categoryName: item.categoryName,
        categoryCode: item.categoryCode,
        subCategory:  item.subCategory,
      }));
      setNeedCatgoryOpt(options);
    } catch (err) {
      console.error("[getNeedCategory]", err);
    }
  };

  const getLeadStatus = async () => {
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/picklist/status/getAllStatus`);
      const options = res.data.status.map((item) => ({
        label:      item.statusName,
        value:      item.statusName,
        statusName: item.statusName,
        statusCode: item.statusCode,
      }));
      setLeadStatusOpt(options);
    } catch (err) {
      console.error("[getLeadStatus]", err);
    }
  };

  /**
   * fetchUsers — loads the user list for Territory Manager, Assigned To,
   * and Assigned By selects.
   *
   * CHANGED vs old code:
   *   Old: mapped to { label: fullName, value: fullName }
   *        → sent full name string to backend
   *
   *   New: maps via toUserOption() → { label: fullName, value: user._id }
   *        → sends ObjectId to backend as assignedToId / assigneeId /
   *          territoryManagerId
   *
   * All three selects share the same empOpt list — one fetch, three dropdowns.
   */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/users/allusers`);
      const options = res.data.map(toUserOption);
      setEmpOpt(options);
    } catch (err) {
      console.error("[fetchUsers]", err);
      Swal.fire({ icon: "error", text: "Something went wrong fetching users." });
    }
  };

  async function statusOptions() {
    try {
      const res = await axios.get(`${apiPath.prodPath}/api/picklist/clientStatus/getAllclientStatus`);
      const options = res.data.clientStatus.map((item) => ({
        label: item.status,
        value: item.status,
      }));
      setStatusOpt(options);
    } catch (err) {
      console.error("[statusOptions]", err);
    }
  }

  async function TerritoryOptions(territories) {
    const options = territories.map((item) => ({
      label: item.territoryName,
      value: item.territoryName,
    }));
    setTerritoryOpt(options);
  }

  const getZipCodes = async (search = "") => {
    setZipCodeLoader(true);
    try {
      const res = await axios.get(
        `${apiPath.prodPath}/api/picklist/zipcodes/getzipcodes`,
        { params: { search, limit: 50 } }
      );
      const sortedData = res.data.zipCodes.map((i) => ({
        label: i.zipCode,
        value: i.zipCode,
        city:  i.city,
        state: i.state,
      }));
      setZipCodeOpt(sortedData);
    } catch (err) {
      console.error("[getZipCodes]", err);
    } finally {
      setZipCodeLoader(false);
    }
  };

  const debouncedGetZipCodes = debounce((inputValue) => {
    if (inputValue) getZipCodes(inputValue);
    else setZipCodeOpt([]);
  }, 300);

  // ── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    getNeedCategory();
    getLeadStatus();
    statusOptions();
    getZipCodes();
    fetchUsers();

    axios
      .get(`${apiPath.prodPath}/api/picklist/territory/getallterritory`)
      .then((res) => TerritoryOptions(res.data.territories))
      .catch((err) => console.error("[territory fetch]", err));

    if (edit && editData) {
      setClientName(editData.clientName || "");
      setPrimaryContact(editData.primaryContact || "");
      setEmail(editData.email || "");
      setPhone(editData.phone || "");
      setFax(editData.fax || "");
      setAddress1(editData.address1 || "");
      setAddress2(editData.address2 || "");
      setState(editData.state || "");
      setWebsiteAddress(editData.websiteAddress || "");
      setBusRegDate(editData.busRegDate ? moment(editData.busRegDate).format("YYYY-MM-DD") : "");
      setResearchPriority(editData.researchPriority || "");

      setCity(editData.city ? { label: editData.city, value: editData.city } : null);
      setZipCode(editData.zipCode ? { label: editData.zipCode, value: editData.zipCode } : null);
      setStatus(editData.status ? { label: editData.status, value: editData.status } : null);
      setTerritory(editData.territory ? { label: editData.territory, value: editData.territory } : null);

      // CHANGED: editData.assignedTo / .assignee / .territoryManager are now
      // UserRef objects { id, name } from the new model.
      // toEditUserOption() converts them to { label, value: id } for react-select.
      setAssignedTo(toEditUserOption(editData.assignedTo));
      setAssignedBy(toEditUserOption(editData.assignee));
      setTerritoryManager(toEditUserOption(editData.territoryManager));
    }
  }, [open]);

  // ── Form submission ──────────────────────────────────────────────────────────

  const handleAddClient = (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Plain string fields — unchanged
    formData.append("clientName",        clientName);
    formData.append("primaryContact",    primaryContact);
    formData.append("email",             email);
    formData.append("phone",             phone);
    formData.append("fax",               fax);
    formData.append("address1",          address1);
    formData.append("address2",          address2);
    formData.append("city",              city?.value      || "");
    formData.append("state",             state);
    formData.append("zipCode",           zipCode?.value   || "");
    formData.append("websiteAddress",    websiteAddress);
    formData.append("status",            status?.value    || "");
    formData.append("territory",         territory?.value || "");
    formData.append("busRegDate",        busRegDate.toString());
    formData.append("needCategoryName",  needCategoryName);
    formData.append("needCategoryCode",  needCategoryCode);
    formData.append("needSubCategoryName", needSubCategoryName);
    formData.append("needSubCategoryCode", needSubCategoryCode);
    formData.append("leadStatus",        leadStatus?.value || "");
    formData.append("researchPriority",  researchPriority);
    formData.append("researchTag",       researchTag);

    // CHANGED: send _id (ObjectId) instead of full name / username strings.
    // Backend field names changed from:
    //   assignedTo      → assignedToId
    //   assignee        → assigneeId
    //   territoryManager → territoryManagerId
    // The backend buildUserRef() resolves each id to { id, name } before saving.
    formData.append("assignedToId",       assignedTo?.value       || "");
    formData.append("assigneeId",         assignedBy?.value       || "");
    formData.append("territoryManagerId", territoryManager?.value || "");

    if (edit) {
      editEmp(formData);
    } else {
      addEmp(formData);
      dataReset();
    }
  };

  const dataReset = () => {
    setClientName("");
    setPrimaryContact("");
    setEmail("");
    setPhone("");
    setFax("");
    setAddress1("");
    setAddress2("");
    setCity(null);
    setState("");
    setZipCode(null);
    setWebsiteAddress("");
    setStatus(null);
    setTerritory(null);
    setTerritoryManager(null);
    setAssignedTo(null);
    setAssignedBy(null);
    setBusRegDate("");
    setResearchPriority("");
    setResearchTag(false);
    setNeedCategory(null);
    setNeedSubCategory(null);
    setNeedCategoryName("");
    setNeedCategoryCode("");
    setNeedSubCategoryName("");
    setNeedSubCategoryCode("");
    setLeadStatus(null);
  };

  // ── Select handlers ──────────────────────────────────────────────────────────

  const handleInputChange             = (v) => { setInputValue(v);            debouncedGetZipCodes(v); };
  const handleInputStatusChange       = (v) => setInputStatusValue(v);
  const handleInputTerritoryChange    = (v) => setInputTerritoryValue(v);
  const handleInputCityChange         = (v) => setInputValueCity(v);
  const handleInputNeedCategoryChange = (v) => setInputNeedCategory(v);
  const handleInputNeedSubChange      = (v) => setInputNeedSub(v);
  const handleInputLeadStatusChange   = (v) => setInputLeadStatusValue(v);
  const handleInputTerritoryManagerChange = (v) => setInputTerritoryManager(v);
  const handleInputAssignedToChange   = (v) => setInputAssignedTo(v);
  const handleInputAssignedByChange   = (v) => setInputAssignedBy(v);

  const handleNeedCategoryChange = (v) => {
    setNeedCategory(v);
    setNeedCategoryName(v.categoryName);
    setNeedCategoryCode(v.categoryCode);
    setNeedSubCategoryOpt(
      v.subCategory.map((item) => ({
        label:           item.subCategoryName,
        value:           item.subCategoryName,
        subCategoryCode: item.subCategoryCode,
      }))
    );
  };

  const handleNeedSubCategoryChange = (v) => {
    setNeedSubCategory(v);
    setNeedSubCategoryName(v.label);
    setNeedSubCategoryCode(v.subCategoryCode);
  };

  const handleChangeCity = (v) => setCity(v);

  // ── Styles ───────────────────────────────────────────────────────────────────

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#191526",
      color: "white",
      borderRadius: "12px",
      padding: "5px",
      borderColor: "#452C95",
      "&:hover": { borderColor: "darkviolet" },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#191526",
      borderRadius: "12px",
      padding: "5px",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "darkviolet" : "#191526",
      color: "white",
      "&:hover": { backgroundColor: "darkviolet" },
      borderRadius: "12px",
      padding: "5px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Drawer
      className="bg-all-modals"
      anchor="left"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: "1142px",
          height: "dvh",
          position: "absolute",
          left: "15%",
          top: "1%",
          transform: "translate(-50%, -50%)",
          borderRadius: "16px",
          boxShadow: 3,
          marginTop: "30px",
          marginBottom: "30px",
        },
      }}
    >
      <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap">
        <div className="flex flex-row justify-end">
          <CloseIcon className="text-2xl hover:cursor-pointer" onClick={handleClose} />
        </div>

        <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Add Lead/Client</h1>

        <form
          onSubmit={handleAddClient}
          className="flex flex-col flex-wrap gap-5 items-center scroll-my-2"
        >
          {/* Row 1 — Name / Status / Territory */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Company/Client Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter Client Name"
                name="clientName"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Status</label>
              <Select
                options={statusOpt}
                value={status}
                onInputChange={handleInputStatusChange}
                inputValue={inputStatusValue}
                onChange={setStatus}
                placeholder="Select Status"
                styles={customStyles}
                name="Status"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Territory</label>
              <Select
                options={territoryOpt}
                value={territory}
                onInputChange={handleInputTerritoryChange}
                inputValue={inputTerritoryValue}
                onChange={setTerritory}
                placeholder="Select Territory"
                styles={customStyles}
                name="Territory"
              />
            </div>
          </div>

          {/* Row 2 — ZipCode / City / State */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">ZipCode</label>
              <Select
                options={zipCodeOpt}
                value={zipCode}
                onInputChange={handleInputChange}
                inputValue={inputValue}
                onChange={(v) => {
                  setZipCode(v);
                  setCityOpt(v.city.map((item) => ({ label: item, value: item })));
                  setState(v.state);
                }}
                placeholder="Select ZipCode"
                styles={customStyles}
                name="zipCode"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">City</label>
              <Select
                options={cityOpt}
                value={city}
                onInputChange={handleInputCityChange}
                inputValue={inputValueCity}
                onChange={handleChangeCity}
                placeholder="Select City"
                styles={customStyles}
                name="City"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">State</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Enter State"
                name="state"
              />
            </div>
          </div>

          {/* Row 3 — Primary Contact / Email / Phone */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Primary Contact Name</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={primaryContact}
                onChange={(e) => setPrimaryContact(e.target.value)}
                placeholder="Enter Primary Contact"
                name="primaryContact"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Email</label>
              <input
                type="email"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                name="email"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Phone</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone"
                name="phone"
              />
            </div>
          </div>

          {/* Row 4 — Fax / Address 1 / Address 2 */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Fax#</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="Enter Fax Address"
                name="fax"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Address 1</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Enter Address 1"
                name="address1"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Address 2</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Enter Address 2"
                name="address2"
              />
            </div>
          </div>

          {/* Row 5 — Territory Manager / Assigned To / Assigned By
              CHANGED: all three selects now use empOpt whose values are _id strings.
              The display (label) is still the full name — nothing changes visually.
              What changes is what gets submitted: ObjectId instead of name string. */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Territory Manager</label>
              <Select
                options={empOpt}
                value={territoryManager}
                onInputChange={handleInputTerritoryManagerChange}
                inputValue={inputTerritoryManager}
                onChange={setTerritoryManager}
                placeholder="Select Territory Manager"
                styles={customStyles}
                name="territoryManager"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Assigned To</label>
              <Select
                options={empOpt}
                value={assignedTo}
                onInputChange={handleInputAssignedToChange}
                inputValue={inputAssignedTo}
                onChange={setAssignedTo}
                placeholder="Select Assigned To"
                styles={customStyles}
                name="assignedTo"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Assigned By</label>
              <Select
                options={empOpt}
                value={assignedBy}
                onInputChange={handleInputAssignedByChange}
                inputValue={inputAssignedBy}
                onChange={setAssignedBy}
                placeholder="Select Assigned By"
                styles={customStyles}
                name="assignedBy"
              />
            </div>
          </div>

          {/* Row 6 — Website / Need Category / Need Sub-Category */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Website Address</label>
              <input
                type="text"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={websiteAddress}
                onChange={(e) => setWebsiteAddress(e.target.value)}
                placeholder="Enter Client Web address"
                name="websiteAddress"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Client Need Category</label>
              <Select
                options={needCatgoryOpt}
                value={needCategory}
                onInputChange={handleInputNeedCategoryChange}
                inputValue={inputNeedCategory}
                onChange={handleNeedCategoryChange}
                placeholder="Select Need Category"
                styles={customStyles}
                name="needCategory"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Client Need Sub-Category</label>
              <Select
                options={needSubCategoryOpt}
                value={needSubCategory}
                onInputChange={handleInputNeedSubChange}
                inputValue={inputNeedSub}
                onChange={handleNeedSubCategoryChange}
                placeholder="Select Need Sub-Category"
                styles={customStyles}
                name="needSubCategory"
              />
            </div>
          </div>

          {/* Row 7 — Lead Status / Bus Reg Date / Research Priority */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Lead-Status</label>
              <Select
                options={leadStatusOpt}
                value={leadStatus}
                onInputChange={handleInputLeadStatusChange}
                inputValue={inputLeadStatusValue}
                onChange={setLeadStatus}
                placeholder="Select Lead Status"
                styles={customStyles}
                name="leadStatus"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Bus Registration Date</label>
              <input
                type="date"
                className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                value={busRegDate}
                onChange={(e) => setBusRegDate(e.target.value)}
                name="busRegDate"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/3">
              <label className="font-satoshi text-md">Research Priority</label>
              <select
                className="bg-[#1b071b] text-white px-2 py-1 rounded"
                value={researchPriority || ""}
                onChange={(e) => setResearchPriority(e.target.value)}
              >
                <option value="">Select Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Row 8 — Research toggle */}
          <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
            <Box>
              <p>Research</p>
              <ToggleButtonGroup
                value={researchTag}
                exclusive
                onChange={handleChange}
                aria-label="research toggle"
              >
                <ToggleButton value={true}  aria-label="add to research">
                  <CheckIcon />
                </ToggleButton>
                <ToggleButton value={false} aria-label="remove from research">
                  <CloseIcon />
                </ToggleButton>
              </ToggleButtonGroup>
              {researchTag === true && (
                <Typography variant="body2" color="success.main" mt={1}>
                  ✅ Added to Research
                </Typography>
              )}
              {researchTag === false && (
                <Typography variant="body2" color="error.main" mt={1}>
                  ❌ Removed from Research
                </Typography>
              )}
            </Box>
          </div>

          {/* Submit */}
          <div className="flex flex-col items-end gap-2 w-full">
            <input
              type="submit"
              className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
              value={edit ? "Save" : "Add Client"}
            />
          </div>
        </form>
      </div>
    </Drawer>
  );
}

export default AddCLient;