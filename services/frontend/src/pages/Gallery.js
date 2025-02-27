import React, { useEffect, useState } from "react";
import apis, { baseURL } from "../apis";

const getImageUrl = (fileName) => {
  return `${baseURL}/images/${fileName}`;
};

const Gallery = () => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    apis
      .get("/images")
      .then((response) => {
        setFiles(response.data.files);
      })
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);

    apis
      .post("/images", formData)
      .then((response) => {
        console.log("File uploaded successfully:", response.data.name);
        setFiles([response.data.name, ...files]);
      })
      .catch((error) => console.error("Error uploading file:", error));
  };

  return (
    <div>
      <h1>Image Gallery</h1>
      <div>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={handleFileChange} required />
          <button type="submit">Upload</button>
        </form>
      </div>

      <div>
        {files.map((fileName, index) => (
          <img key={index} src={getImageUrl(fileName)} alt={`Image ${index}`} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
