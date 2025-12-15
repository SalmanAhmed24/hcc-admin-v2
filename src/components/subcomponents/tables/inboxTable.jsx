// import React, { useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import MoreVertIcon from "@mui/icons-material/MoreVert";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import Pagination from "@mui/material/Pagination";
// // import moment from "moment";
// // import AddPicklist from "../drawers/picklist";
// // import { apiPath } from "@/utils/routes";
// // import axios from "axios";
// // import Swal from "sweetalert2";
// // import { color } from "@mui/system";
// // import AddSalelist from "../drawers/salelist";
// // import SaleDetails from "../drawers/saleListOpen";
// import moment from "moment";
// import MailDetails from "../drawers/businessListingOpen";

// import { Button } from "@/components/ui/button";
// import { Refresh } from "lucide-react";
// // import { useRouter } from "next/navigation";
// // import useAuthStore from "@/store/store";

// function InboxTable({ picklistData, refreshData, picklistName  }) {
//   const [empId, setEmpId] = useState("");
//   const [openModal, setOpenModal] = useState(false);
//   // const [currentPage, setCurrentPage] = useState(1);
//   // const itemsPerPage = 8;
//   console.log(picklistData);
//   // const handlePageChange = (event, page) => {
//   //   setCurrentPage(page);
//   // };

//   const handleEdit = (item) => {
//     setAddModal(true);
//     setId(item._id);
//     setItem(item);
//   };

//    const handleOpenModal = (item) => {
//     setEmpId(item._id);
//     setOpenModal(true);
//   };

//   console.log("This is picklist data", picklistData);

//   return (
//     <div>
//        <div className="flex flex-row items-center gap-2">
//         <Button
//             className="bg-[#452C95] w-1/3 text-white hover:bg-[#452C95] hover:opacity-80"
//             onClick={() => refreshData()}
//         >
//             Refresh
//         </Button>
//         </div>
//       {picklistData.length ? (
//         <>
//           <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
//             <TableCaption>A list of all {picklistName}.</TableCaption>
//             <TableHeader>
//               <TableRow className="w-fit, h-[58px] font-satoshi text-lg text-[#E1C9FF]">
//                 <TableHead className="text-[#E1C9FF]">Actions</TableHead>
//                 {picklistName === "Inbox" && (
//                   <>
//                     <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Subject</TableHead>
//                     <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>From</TableHead>
//                     <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>snippet</TableHead>
//                     <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date</TableHead>
//                     <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>MSG ID</TableHead>
//                   </>
//                 )}
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {picklistData.map((i) => (
//                 <TableRow className="w-fit, h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]" key={i._id}>
//                   <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger>
//                         <MoreVertIcon />
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                         <DropdownMenuSeparator />
//                          <DropdownMenuItem onClick={() => handleOpenModal(i)}>
//                           Open
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                   {picklistName === "Inbox" && (
//                     <>
//                       <TableCell className="font-satoshi font-medium text-#fff">
//                         {`${i.subject}`}
//                       </TableCell>
//                       <TableCell className="font-satoshi font-medium text-#fff">
//                         {i.from}
//                       </TableCell>
//                       <TableCell className="font-satoshi font-medium text-#fff">
//                         {i.snippet}
//                       </TableCell>
//                       <TableCell className="font-satoshi font-medium text-#fff">
//                         {moment(i.date).format("DD-MM-YYYY")}
//                       </TableCell>
//                       <TableCell className="font-satoshi font-medium text-#fff">
//                         {i.msgId}
//                       </TableCell>
//                     </>
//                   )}
//                 </TableRow>
//               ))}
//               {openModal && empId === i._id && (
//                     <MailDetails
//                       open={openModal}
//                       handleClose={() => setOpenModal(false)}
//                       item={i}
//                     />
//                   )}
//             </TableBody>
//           </Table>
//               <Pagination
//             count={totalPages}
//             page={currentPage}
//             onChange={onPageChange}
//             sx={{
//               marginTop: "20px",
//               display: "flex",
//               justifyContent: "center",
//               borderRadius: "20px", 
//               backgroundColor: "#333", 
               
//               ".MuiPaginationItem-root": {
//                 color: "white", 
//               },
//               ".MuiPaginationItem-root.Mui-selected": {
//                 backgroundColor: "#555", 
//                 color: "white", 
//               },
//               ".MuiPaginationItem-root:hover": {
//                 backgroundColor: "#444", 
//               },
//             }}
//           />

//         </>
//       ) : (
//         <p className="text-xl">No {picklistName} Data found</p>
//       )}
//     </div>
//   );
// }

// export default InboxTable;

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Pagination from "@mui/material/Pagination";
import moment from "moment";
import MailDetails from "../drawers/mailOpen";
import { Button } from "@/components/ui/button";

function InboxTable({ picklistData, refreshData, picklistName }) {
  const [empId, setEmpId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination logic
  const totalPages = Math.ceil(picklistData.length / itemsPerPage);
  const currentItems = picklistData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onPageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (item) => {
    setEmpId(item.id);
    setOpenModal(true);
  };

  return (
    <div>
      <div className="flex flex-row items-center gap-2 mb-4">
        <Button
          className="bg-[#452C95] w-1/3 text-white hover:bg-[#452C95] hover:opacity-80"
          onClick={() => refreshData()}
        >
          Refresh
        </Button>
      </div>

      {picklistData.length ? (
        <>
          <Table className="bg-[#231C46] rounded-[12px] font-satoshi">
            <TableCaption>A list of all {picklistName}.</TableCaption>

            <TableHeader>
              <TableRow className="w-fit h-[58px] font-satoshi text-lg text-[#E1C9FF]">
                <TableHead className="text-[#E1C9FF]">Actions</TableHead>
                {picklistName === "Inbox" && (
                  <>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Subject</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>From</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Snippet</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>Date</TableHead>
                    <TableHead className="text-[#E1C9FF]" style={{ minWidth: 150 }}>MSG ID</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((i) => (
                <TableRow
                  className="w-fit h-[72px] bg-[#2D245B] border-[1px] border-[#452C95]"
                  key={i.id}
                >
                  <TableCell className="font-satoshi font-medium text-[#E1C9FF]">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenModal(i)}>
                          Open
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  {picklistName === "Inbox" && (
                    <React.Fragment key={`${i._id}-cells`}>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.subject}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.from}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.snippet}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {moment(i.date).format("DD-MM-YYYY")}
                      </TableCell>
                      <TableCell className="font-satoshi font-medium text-white">
                        {i.id}
                      </TableCell>
                    </React.Fragment>
                  )}

                  {openModal && empId === i.id && (
                    <MailDetails
                      open={openModal}
                      handleClose={() => setOpenModal(false)}
                      item={i}
                    />
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={onPageChange}
            sx={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
              borderRadius: "20px",
              backgroundColor: "#333",
              ".MuiPaginationItem-root": {
                color: "white",
              },
              ".MuiPaginationItem-root.Mui-selected": {
                backgroundColor: "#555",
                color: "white",
              },
              ".MuiPaginationItem-root:hover": {
                backgroundColor: "#444",
              },
            }}
          />
        </>
      ) : (
        <p className="text-xl">No {picklistName} Data found</p>
      )}
    </div>
  );
}

export default InboxTable;


