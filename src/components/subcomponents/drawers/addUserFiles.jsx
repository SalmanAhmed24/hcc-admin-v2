import axios from "axios";
import { apiPath } from "@/utils/routes";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";
import { Edit2Icon, Trash, View } from "lucide-react";
import Swal from "sweetalert2";
import Select from "react-select";
import useAuthStore from "@/store/store";
import { Drawer } from "@mui/material";
import { Add } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";


// function AddTags( {tagsStored, initialTags = [], placeholder = "Add Tags", onChange = () => {} }){
//     const [tags, setTags] = useState(initialTags ? () => initialTags.map((r) => normalizeRecipient(r)) : []);
//     const [input, setInput] = useState("");
//     const [open, setOpen] = useState(false);
//     const [highlight, setHighlight] = useState(0);
//     const wrapperRef = useRef(null);
//     const inputRef = useRef(null);

//     useEffect(() => onChange(tags.map((r) => r)), [tags]);

//     useEffect(() => {
//       function handleClick(e) {
//         if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
//           setOpen(false);
//           setHighlight(0);
//         }
//       }

//       document.addEventListener("click", handleClick);

//       return () => {
//         document.removeEventListener("click", handleClick);
//       };
//     }, []);

//     function normalizeTag(r) {
//       if (typeof r === "string") {
//         return r;
//       }
//       else {
//         return null
//       }
//      }

//     function addTag(r) {
//       const normalized = normalizeTag(r);
//       if (!normalized) return;
//       setTags((prev) => [...prev, normalized]);
//       setInput("");
//       setOpen(false);
//       setHighlight(0);
//       inputRef.current.focus();
//     }
    
//     function removeTag(r) {
//       setTags((prev) => prev.filter((p) => p !== r));
//       inputRef.current.focus();
//     }
    
//     function handleKeyDown(e) {
//       if (e.key === "Backspace" && !input && recipients.length) {
//         removeTag(recipients[recipients.length - 1]);
//       }

//       if (e.key === "Enter" && input) {
//         addTag(input);
//       }

//       if (e.key === "ArrowDown" && open) {
//         e.preventDefault();
//         setHighlight((prev) => (prev + 1) % filteredContacts.length);
//       }

//       if (e.key === "ArrowUp" && open) {
//         e.preventDefault();
//         setHighlight(
//           (prev) => (prev - 1 + filteredContacts.length) % filteredContacts.length
//         );
//       }

//       if (e.key === "Escape") {
//         setOpen(false);
//         setHighlight(0);
//       }

//       if (e.key === "Tab" && open && filteredContacts.length) {
//         e.preventDefault();
//         addTag(filteredContacts[highlight]);
//       }
//     }

//     function handleInputChange(e) {
//       setInput(e.target.value);
//       setOpen(!!e.target.value);
//       setHighlight(0);
//     }

//     function handleContactClick(r) {
//       addTag(r);
//       setInput("");
//       setOpen(false);
//       setHighlight(0);
//     }
    
//     const filteredContacts = tagsStored?.filter((c) => {
//       const normalized = normalizeTag(c);
//       const search = input.toLowerCase();
//       return (
//         (normalized.toLowerCase().includes(search) ||
//           normalized.value.toLowerCase().includes(search)) &&
//         !tags.some((r) => r === normalized)
//       );
//     });

//     return (
//       <div className="relative w-full" ref={wrapperRef}>
//         <div className="flex flex-wrap gap-1 p-2 border rounded-lg">
//           {tags.map((r, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded-full text-gray-800"
//             >
//               <span>{r ?? r.value}</span>
//               <button
//                 type="button"
//                 onClick={() => removeTag(r)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 &times;
//               </button>
//             </div>
//           ))}
//           <input
//             ref={inputRef}
//             type="text"
//             value={input}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             onFocus={() => setOpen(!!input)}
//             placeholder={placeholder}
//             className="flex-1 p-1 text-sm border-none outline-none"
//           />
//         </div>
//         {open && filteredContacts?.length > 0 && (
//           <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg max-h-60">
//             {filteredContacts?.map((c, i) => {
//               const normalized = normalizeTag(c);
//               const search = input.toLowerCase();
//               const email = normalized.email ?? normalized.value;
//               const index = email.toLowerCase().indexOf(search);
//               const before = email.substring(0, index);
//               const match = email.substring(index, index + search.length);
//               const after = email.substring(index + search.length);

//               return (
//                 <li
//                   key={i}
//                   onClick={() => handleContactClick(c)}
//                   className={`px-4 py-2 cursor-pointer ${
//                     i === highlight ? "bg-gray-100" : ""
//                   }`}
//                 >
//                   {before}
//                   <span className="font-bold">{match}</span>
//                   {after}
//                 </li>
//               );
//             })}
//           </ul>
//         )}
//       </div>
//     );
//   }

function AddTags({ tagsStored, initialTags = [], placeholder = "Add Tags", onChange = () => {} }) {
  const [tags, setTags] = useState(initialTags ? () => initialTags.map((t) => normalizeTag(t)) : []);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    onChange(tags);
  }, [tags, onChange]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setHighlight(0);
      }
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  function normalizeTag(t) {
    if (typeof t === "string") {
      return t;
    }
    if (t && typeof t === "object" && t.value) {
      return t.value;
    }
    return t ? String(t) : "";
  }

  function addTag(t) {
    const normalized = normalizeTag(t);
    if (!normalized || tags.includes(normalized)) return;
    setTags((prev) => [...prev, normalized]);
    setInput("");
    setOpen(false);
    setHighlight(0);
    inputRef.current?.focus();
  }

  function removeTag(t) {
    setTags((prev) => prev.filter((p) => p !== t));
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Backspace" && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }

    if (e.key === "Enter" && input) {
      e.preventDefault();
      addTag(input);
    }

    if (e.key === "ArrowDown" && open) {
      e.preventDefault();
      setHighlight((prev) => (prev + 1) % (filteredTags?.length || 1));
    }

    if (e.key === "ArrowUp" && open) {
      e.preventDefault();
      setHighlight(
        (prev) => (prev - 1 + (filteredTags?.length || 1)) % (filteredTags?.length || 1)
      );
    }

    if (e.key === "Escape") {
      setOpen(false);
      setHighlight(0);
    }

    if (e.key === "Tab" && open && filteredTags?.length) {
      e.preventDefault();
      addTag(filteredTags[highlight]);
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
    setOpen(!!e.target.value);
    setHighlight(0);
  }

  function handleTagClick(t) {
    addTag(t);
  }

  const filteredTags = tagsStored?.filter((t) => {
    const normalized = normalizeTag(t);
    const search = input.toLowerCase();
    return (
      normalized.toLowerCase().includes(search) &&
      !tags.includes(normalized)
    );
  });

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex flex-wrap gap-1 p-2 border rounded-lg">
        {tags.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded-full text-gray-800"
          >
            <span>{t}</span>
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(!!input)}
          placeholder={placeholder}
          className="flex-1 p-1 text-sm border-none outline-none"
        />
      </div>
      {open && filteredTags?.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg max-h-60">
          {filteredTags?.map((t, i) => {
            const normalized = normalizeTag(t);
            const search = input.toLowerCase();
            const index = normalized.toLowerCase().indexOf(search);
            const before = normalized.substring(0, index);
            const match = normalized.substring(index, index + search.length);
            const after = normalized.substring(index + search.length);

            return (
              <li
                key={i}
                onClick={() => handleTagClick(t)}
                className={`px-4 py-2 cursor-pointer ${
                  i === highlight ? "bg-gray-100" : ""
                }`}
              >
                {before}
                <span className="font-bold">{match}</span>
                {after}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}



const AddUserFiles = ({open, handleClose, item = {}, editAttachments = false, refreshData}) => {
    const user = useAuthStore((state) => state.user);
    const [file, setFile] = useState({});
    const [fileCategory, setFileCategory] = useState("");
    const [fileCategoryOpt, setFileCategoryOpt] = useState([]);
    const [inputFileCatagory, setInputFileCatagory] = useState("");
    const [note, setNote] = useState("");
    const [files, setFiles] = useState([]);
    const [newFileFlag, setNewFileFlag] = useState(false);

    const [tag , setTag] = useState([]);
    
    let username = user?.user.username;
    let fullname = `${user?.user.firstName} ${user?.user.secondName}`;


    const handleFileChange = (e) => {
    if(editAttachments){
      setNewFileFlag(true);
    }
    const selectedFile = e.target.files[0]; 
    setFiles((prevFiles) => [...prevFiles, selectedFile]); 
    console.log(files);
  };

  const handleInputFileCatagory = (newInputValue) => {
    if(editAttachments){
      setNewFileFlag(true);
    }
    setInputFileCatagory(newInputValue); 
  };

  async function fileCatagoryOptions () {
      const fileCategories = await axios.get(`${apiPath.prodPath}/api/picklist/fileCategory/getAllFileCategory`)
      .then((res) => {
        const fileCategoryArr = res.data.fileCategory;
        return fileCategoryArr;
      }); 
      const options = fileCategories.map((item)=>{
        const statusOption = {
          label : item.categoryName,
          value : item.categoryName,
        }
        return statusOption;
      });
      setFileCategoryOpt(options);
    }

    useEffect(() => {
      fileCatagoryOptions();
    }, []);

    useEffect(() => {
      if(editAttachments){
        setFileCategory(editAttachments.attachmentCategories);
        setNote(editAttachments.note);
      }
    }, [editAttachments]);


    const handleUpload = async (e) => {
    e.preventDefault();
    if (editAttachments){
      const formData = new FormData();
      console.log(fileCategory.value, " ",note, " ",username, "  ",fullname);
      formData.append("attachmentCategories", fileCategory.value);

      if (Array.isArray(tag)) {
       formData.append("recipients", JSON.stringify(tag));
      } else if (typeof to === 'string') {
        formData.append('recipients', tag);
      }
      
        if (files.length) {
          files.forEach((file) => {
            formData.append("files", file);
          });
          }

      formData.append("date", new Date().toISOString()); 
      formData.append("note", note);
      formData.append("username", username);
      formData.append("fullname", fullname);

      editFiles(formData);
      setFiles([]);
      setFileCategory('');
      setNote('');
      setTag('');
      handleClose();

    }else{
       const formData = new FormData();
      console.log(fileCategory.value, " ",note, " ",username, "  ",fullname);
      formData.append("attachmentCategories", fileCategory.value);

      if (Array.isArray(tag)) {
       formData.append("tag", JSON.stringify(tag));
      } else if (typeof to === 'string') {
        formData.append('tag', tag);
      }
      
        if (files.length) {
          files.forEach((file) => {
            formData.append("files", file);
          });
          }

      formData.append("date", new Date().toISOString()); 
      formData.append("note", note);
      formData.append("username", username);
      formData.append("fullname", fullname);
  
      sendFiles(formData);
      setFiles([]);
      setFileCategory('');
      setNote('');
      setTag('');
      handleClose();
      
    }
    
  };

  async function sendFiles(data) {
    console.log('here in send files');
    try {
      const res = await axios.post(
        `${apiPath.prodPath}/api/files/addFile`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      console.log("Upload response:", res);
      await refreshData();
       
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with sending files",
      });
    }
  }

  async function editFiles(data) {
    console.log('here in edit files');
    // for (const pair of data.entries()) {
    //   console.log(pair[0], pair[1]);
    // };
    try {
      const res = await axios.patch(
        `${apiPath.prodPath}/api/files/modifyFile/${item._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      console.log("Upload response:", res);
      await refreshData();
       
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        text: "Something went wrong with sending files",
      });
    }
  }

  async function handleRemove(file) {
       setFiles((prevFiles) =>
            prevFiles.filter((item) => item.name !== file.name)
          );
  }

  function handleToChange(list) {
    setTag(list.map((s) => String(s)));
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#191526", 
      color: "white", 
      borderRadius: "12px",       
      padding: "5px",            
      borderColor: "#452C95",
      "&:hover": {
        borderColor: "darkviolet",
      },
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
      "&:hover": {
        backgroundColor: "darkviolet",
      },
      borderRadius: "12px",       
      padding: "5px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white", 
    }),
  };

  return (<> 
          <Drawer
          className="bg-all-modals"
          anchor="left"
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: "50%",
              height: "90%",
              position: "absolute",
              left: "25%",
              top: "5%",
              transform: "translate(-50%, -50%)",
              borderRadius: "16px",
              boxShadow: 3,
              marginTop: "30px",
              marginBottom: "30px",
            },
          }}
        >  <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap">
          
              <div className="flex flex-row justify-end">
                <CloseIcon className="text-2xl hover:cursor-pointer" onClick={() => handleClose()} />
              </div>
              <h1 className="text-white font-satoshi text-2xl font-bold mb-5">Upload Files</h1>
              <form
            onSubmit={handleUpload}
            className="flex flex-col flex-wrap gap-5 items-center scroll-my-2 mt-8 mb-8"
             >
            {/* <h1 className="font-semibold text-xl w-full">Upload Files</h1> */}
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Files</label>
                <input
                  type="file"
                  multiple
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={handleFileChange}
                  name="Files"
                  required
                />
              </div>
                <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">File Catagory</label>
                <Select
                    options={fileCategoryOpt}
                    value={fileCategory}
                    onInputChange={handleInputFileCatagory}
                    inputValue={inputFileCatagory}
                    onChange={(e) => setFileCategory(e)}
                    placeholder="Select File Catagory"
                    styles={customStyles}
                    id="role-select-cus"
                    name="File Catagory"
                    required
                  />
              </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Note</label>
                <input
                  type="text"
                  value={note}
                  className="p-2  border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526]"
                  onChange={(e)=> setNote(e.target.value)}
                  name="note"
                />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <label className="font-satoshi text-md">Add Tags</label>
                  <AddTags onChange={handleToChange} />
              </div>
            </div>
            
            <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">            
              <div className="flex flex-col gap-2 w-1/2" >
                <h3 className="font-satoshi text-md">Selected Files:</h3>
                <ul className="list-disc pl-4 text-xl">
                  {files.map((file, index) => (
                    <li key={index}><Button onClick={() => handleRemove(file)} className="w-fit h-30px m-2 bg-gray-400 rounded-xl text-black font-bold">{file.name} <Trash/> </Button></li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 w-1/2" >
                <h3 className="font-satoshi text-md">Old File:</h3>
                {editAttachments ? (
                  
                    <Button  className="w-fit h-30px m-2 bg-gray-400 rounded-xl text-black font-bold">{file} </Button>
                  
                ) : null}
              </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full">
              <input
                type="submit"
                className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400"
                value={`Upload`}
              />
            </div>
      
          </form>
        </div>
            
        </Drawer>
      </>);
     
}

// export default AddUserFiles;

// import axios from "axios";
// import { apiPath } from "@/utils/routes";
// import React, { useState, useRef, useEffect } from "react";
// import { Button } from "@mui/material";
// import { Trash2Icon } from "lucide-react"; // Fixed import
// import Swal from "sweetalert2";
// import Select from "react-select";
// import useAuthStore from "@/store/store";
// import { Drawer } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// function AddTags({ tagsStored, initialTags = [], placeholder = "Add Tags", onChange = () => {} }) {
//   const [tags, setTags] = useState(initialTags ? () => initialTags.map((t) => normalizeTag(t)) : []);
//   const [input, setInput] = useState("");
//   const [open, setOpen] = useState(false);
//   const [highlight, setHighlight] = useState(0);
//   const wrapperRef = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     onChange(tags);
//   }, [tags, onChange]);

//   useEffect(() => {
//     function handleClick(e) {
//       if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
//         setOpen(false);
//         setHighlight(0);
//       }
//     }

//     document.addEventListener("click", handleClick);

//     return () => {
//       document.removeEventListener("click", handleClick);
//     };
//   }, []);

//   function normalizeTag(t) {
//     if (typeof t === "string") {
//       return t;
//     }
//     if (t && typeof t === "object" && t.value) {
//       return t.value;
//     }
//     return t ? String(t) : "";
//   }

//   function addTag(t) {
//     const normalized = normalizeTag(t);
//     if (!normalized || tags.includes(normalized)) return;
//     setTags((prev) => [...prev, normalized]);
//     setInput("");
//     setOpen(false);
//     setHighlight(0);
//     inputRef.current?.focus();
//   }

//   function removeTag(t) {
//     setTags((prev) => prev.filter((p) => p !== t));
//     inputRef.current?.focus();
//   }

//   function handleKeyDown(e) {
//     if (e.key === "Backspace" && !input && tags.length) {
//       removeTag(tags[tags.length - 1]);
//     }

//     if (e.key === "Enter" && input) {
//       e.preventDefault();
//       addTag(input);
//     }

//     if (e.key === "ArrowDown" && open) {
//       e.preventDefault();
//       setHighlight((prev) => (prev + 1) % (filteredTags?.length || 1));
//     }

//     if (e.key === "ArrowUp" && open) {
//       e.preventDefault();
//       setHighlight(
//         (prev) => (prev - 1 + (filteredTags?.length || 1)) % (filteredTags?.length || 1)
//       );
//     }

//     if (e.key === "Escape") {
//       setOpen(false);
//       setHighlight(0);
//     }

//     if (e.key === "Tab" && open && filteredTags?.length) {
//       e.preventDefault();
//       addTag(filteredTags[highlight]);
//     }
//   }

//   function handleInputChange(e) {
//     setInput(e.target.value);
//     setOpen(!!e.target.value);
//     setHighlight(0);
//   }

//   function handleTagClick(t) {
//     addTag(t);
//   }

//   const filteredTags = tagsStored?.filter((t) => {
//     const normalized = normalizeTag(t);
//     const search = input.toLowerCase();
//     return (
//       normalized.toLowerCase().includes(search) &&
//       !tags.includes(normalized)
//     );
//   });

//   return (
//     <div className="relative w-full" ref={wrapperRef}>
//       <div className="flex flex-wrap gap-1 p-2 border rounded-lg">
//         {tags.map((t, i) => (
//           <div
//             key={i}
//             className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 rounded-full text-gray-800"
//           >
//             <span>{t}</span>
//             <button
//               type="button"
//               onClick={() => removeTag(t)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               &times;
//             </button>
//           </div>
//         ))}
//         <input
//           ref={inputRef}
//           type="text"
//           value={input}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onFocus={() => setOpen(!!input)}
//           placeholder={placeholder}
//           className="flex-1 p-1 text-sm border-none outline-none"
//         />
//       </div>
//       {open && filteredTags?.length > 0 && (
//         <ul className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg max-h-60">
//           {filteredTags?.map((t, i) => {
//             const normalized = normalizeTag(t);
//             const search = input.toLowerCase();
//             const index = normalized.toLowerCase().indexOf(search);
//             const before = normalized.substring(0, index);
//             const match = normalized.substring(index, index + search.length);
//             const after = normalized.substring(index + search.length);

//             return (
//               <li
//                 key={i}
//                 onClick={() => handleTagClick(t)}
//                 className={`px-4 py-2 cursor-pointer ${
//                   i === highlight ? "bg-gray-100" : ""
//                 }`}
//               >
//                 {before}
//                 <span className="font-bold">{match}</span>
//                 {after}
//               </li>
//             );
//           })}
//         </ul>
//       )}
//     </div>
//   );
// }

// const AddUserFiles = ({ open, handleClose, item = {}, editAttachments = false, refreshData }) => {
//   const user = useAuthStore((state) => state.user);
//   const [fileCategory, setFileCategory] = useState("");
//   const [fileCategoryOpt, setFileCategoryOpt] = useState([]);
//   const [inputFileCategory, setInputFileCategory] = useState("");
//   const [note, setNote] = useState("");
//   const [files, setFiles] = useState([]);
//   const [newFileFlag, setNewFileFlag] = useState(false);
//   const [tags, setTags] = useState([]);
//   const [existingFileName, setExistingFileName] = useState("");

//   const username = user?.user.username;
//   const fullname = `${user?.user.firstName || ""} ${user?.user.secondName || ""}`.trim();

//   // Initialize form with existing data when editing
//   useEffect(() => {
//     if (editAttachments && item) {
//       // Set file category
//       if (item.attachmentCategories) {
//         setFileCategory({
//           label: item.attachmentCategories,
//           value: item.attachmentCategories
//         });
//       }
      
//       // Set note
//       setNote(item.note || "");
      
//       // Set tags from item
//       if (item.tag && Array.isArray(item.tag)) {
//         setTags(item.tag);
//       }
      
//       // Set existing file name
//       setExistingFileName(item.filename || "");
//     } else {
//       // Reset form when not editing
//       setFileCategory("");
//       setNote("");
//       setTags([]);
//       setFiles([]);
//       setExistingFileName("");
//       setNewFileFlag(false);
//     }
//   }, [editAttachments, item, open]);

//   const handleFileChange = (e) => {
//     if (editAttachments) {
//       setNewFileFlag(true);
//     }
    
//     const selectedFiles = Array.from(e.target.files);
//     setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
//   };

//   const handleInputFileCategory = (newInputValue) => {
//     if (editAttachments) {
//       setNewFileFlag(true);
//     }
//     setInputFileCategory(newInputValue);
//   };

//   async function fileCategoryOptions() {
//     try {
//       const response = await axios.get(`${apiPath.prodPath}/api/picklist/fileCategory/getAllFileCategory`);
//       const fileCategoryArr = response.data.fileCategory || [];
      
//       const options = fileCategoryArr.map((item) => ({
//         label: item.categoryName,
//         value: item.categoryName,
//       }));
      
//       setFileCategoryOpt(options);
//     } catch (error) {
//       console.error("Error fetching file categories:", error);
//     }
//   }

//   useEffect(() => {
//     fileCategoryOptions();
//   }, []);

//   const handleUpload = async (e) => {
//     e.preventDefault();
    
//     if (!fileCategory?.value) {
//       Swal.fire({
//         icon: "warning",
//         text: "Please select a file category",
//       });
//       return;
//     }

//     if (!editAttachments && files.length === 0) {
//       Swal.fire({
//         icon: "warning",
//         text: "Please select at least one file to upload",
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("attachmentCategories", fileCategory.value);
    
//     // Add tags
//     if (tags.length > 0) {
//       formData.append("tag", JSON.stringify(tags));
//     }
    
//     // Add files if any
//     if (files.length > 0) {
//       files.forEach((file) => {
//         formData.append("files", file);
//       });
//     }
    
//     formData.append("date", new Date().toISOString());
//     formData.append("note", note);
//     formData.append("username", username);
//     formData.append("fullname", fullname);

//     try {
//       if (editAttachments) {
//         await editFiles(formData);
//       } else {
//         await sendFiles(formData);
//       }
      
//       // Reset form and close
//       setFiles([]);
//       setFileCategory("");
//       setNote("");
//       setTags([]);
//       handleClose();
//     } catch (error) {
//       console.error("Upload failed:", error);
//       // Don't close on error
//     }
//   };

//   async function sendFiles(data) {
//     try {
//       const res = await axios.post(
//         `${apiPath.devPath}/api/files/addFile`,
//         data,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       console.log("Upload response:", res);
//       await refreshData();
      
//       Swal.fire({
//         icon: "success",
//         text: "Files uploaded successfully!",
//       });
//     } catch (err) {
//       console.error("Upload error:", err);
//       Swal.fire({
//         icon: "error",
//         text: "Something went wrong with uploading files",
//       });
//       throw err;
//     }
//   }

//   async function editFiles(data) {
//     try {
//       const res = await axios.patch(
//         `${apiPath.devPath}/api/files/modifyFile/${item._id}`,
//         data,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       console.log("Edit response:", res);
//       await refreshData();
      
//       Swal.fire({
//         icon: "success",
//         text: "File updated successfully!",
//       });
//     } catch (err) {
//       console.error("Edit error:", err);
//       Swal.fire({
//         icon: "error",
//         text: "Something went wrong with updating the file",
//       });
//       throw err;
//     }
//   }

//   async function handleRemove(file) {
//     setFiles((prevFiles) =>
//       prevFiles.filter((item) => item.name !== file.name)
//     );
//   }

//   function handleTagsChange(tagsList) {
//     setTags(tagsList);
//   }

//   const customStyles = {
//     control: (provided) => ({
//       ...provided,
//       backgroundColor: "#191526",
//       color: "white",
//       borderRadius: "12px",
//       padding: "5px",
//       borderColor: "#452C95",
//       "&:hover": {
//         borderColor: "darkviolet",
//       },
//     }),
//     menu: (provided) => ({
//       ...provided,
//       backgroundColor: "#191526",
//       borderRadius: "12px",
//       padding: "5px",
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       backgroundColor: state.isSelected ? "darkviolet" : "#191526",
//       color: "white",
//       "&:hover": {
//         backgroundColor: "darkviolet",
//       },
//       borderRadius: "12px",
//       padding: "5px",
//     }),
//     singleValue: (provided) => ({
//       ...provided,
//       color: "white",
//     }),
//   };

//   return (
//     <Drawer
//       className="bg-all-modals"
//       anchor="left"
//       open={open}
//       onClose={handleClose}
//       PaperProps={{
//         sx: {
//           width: "50%",
//           height: "90%",
//           position: "absolute",
//           left: "25%",
//           top: "5%",
//           transform: "translate(-50%, -50%)",
//           borderRadius: "16px",
//           boxShadow: 3,
//           marginTop: "30px",
//           marginBottom: "30px",
//         },
//       }}
//     >
//       <div className="p-10 flex flex-col bg-[#2D245B] flex-wrap h-full overflow-y-auto">
//         <div className="flex flex-row justify-end">
//           <CloseIcon 
//             className="text-2xl hover:cursor-pointer text-white" 
//             onClick={handleClose} 
//           />
//         </div>
        
//         <h1 className="text-white font-satoshi text-2xl font-bold mb-5">
//           {editAttachments ? "Edit File" : "Upload Files"}
//         </h1>
        
//         <form
//           onSubmit={handleUpload}
//           className="flex flex-col flex-wrap gap-5 items-center mt-8 mb-8"
//         >
//           <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
//             <div className="flex flex-col gap-2 w-1/2">
//               <label className="font-satoshi text-md text-white">Files</label>
//               <input
//                 type="file"
//                 multiple={!editAttachments}
//                 className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
//                 onChange={handleFileChange}
//                 name="Files"
//                 required={!editAttachments}
//               />
//               <p className="text-sm text-gray-400">
//                 {editAttachments ? "Select new file to replace existing one" : "Select one or more files"}
//               </p>
//             </div>
            
//             <div className="flex flex-col gap-2 w-1/2">
//               <label className="font-satoshi text-md text-white">File Category</label>
//               <Select
//                 options={fileCategoryOpt}
//                 value={fileCategory}
//                 onInputChange={handleInputFileCategory}
//                 inputValue={inputFileCategory}
//                 onChange={(e) => setFileCategory(e)}
//                 placeholder="Select File Category"
//                 styles={customStyles}
//                 id="role-select-cus"
//                 name="File Category"
//                 required
//               />
//             </div>
//           </div>

//           <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
//             <div className="flex flex-col gap-2 w-1/2">
//               <label className="font-satoshi text-md text-white">Note</label>
//               <input
//                 type="text"
//                 value={note}
//                 className="p-2 border-[#452C95] rounded-[8px] focus-within:outline-none border-[1px] bg-[#191526] text-white"
//                 onChange={(e) => setNote(e.target.value)}
//                 name="note"
//                 placeholder="Add a note (optional)"
//               />
//             </div>
            
//             <div className="flex flex-col gap-2 w-1/2">
//               <label className="font-satoshi text-md text-white">Add Tags</label>
//               <AddTags 
//                 onChange={handleTagsChange} 
//                 initialTags={tags}
//                 placeholder="Type to add tags..."
//               />
//             </div>
//           </div>

//           <div className="flex flex-row gap-4 w-full items-center justify-between pb-6 border-b-[1px] border-[#7F56D9]">
//             <div className="flex flex-col gap-2 w-1/2">
//               <h3 className="font-satoshi text-md text-white">Selected Files:</h3>
//               <ul className="list-disc pl-4">
//                 {files.map((file, index) => (
//                   <li key={index} className="text-white mb-2">
//                     <Button 
//                       onClick={() => handleRemove(file)} 
//                       className="w-fit h-8 m-2 bg-gray-400 rounded-xl text-black font-bold hover:bg-red-500"
//                     >
//                       {file.name} <Trash2Icon size={16} className="ml-2" />
//                     </Button>
//                   </li>
//                 ))}
//                 {files.length === 0 && (
//                   <li className="text-gray-400">No new files selected</li>
//                 )}
//               </ul>
//             </div>
            
//             <div className="flex flex-col gap-2 w-1/2">
//               <h3 className="font-satoshi text-md text-white">
//                 {editAttachments ? "Existing File:" : ""}
//               </h3>
//               {editAttachments && existingFileName && (
//                 <div className="p-3 bg-[#191526] rounded-lg border border-[#452C95]">
//                   <p className="text-white truncate">{existingFileName}</p>
//                   <p className="text-gray-400 text-sm">Current file will be kept unless replaced</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-col items-end gap-2 w-full">
//             <input
//               type="submit"
//               className="w-[144px] h-[42px] p-2 rounded-[8px] bg-[#7F56D9] self-end text-white hover:text-white hover:bg-orange-400 cursor-pointer"
//               value={editAttachments ? "Update" : "Upload"}
//             />
//           </div>
//         </form>
//       </div>
//     </Drawer>
//   );
// };

export default AddUserFiles;
