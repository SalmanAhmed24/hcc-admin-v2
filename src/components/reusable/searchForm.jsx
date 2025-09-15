import React, { useState } from 'react'

const SearchForm = ({handleSearch}) => {
  const [name,setName] = useState("")
  const handleForm = e =>{
    e.preventDefault()
    const dataObj={
      name
    }
    handleSearch(dataObj)
  }
  return (
    <form onSubmit={handleForm} className="flex flex-row gap-4 w-full">
        <label>This is new comp</label>
        <input type='text' value={name} className='text-black' onChange={(e)=>setName(e.target.value)} />
        <input type='submit' value={'search'} />
        </form>
  )
}

export default SearchForm
