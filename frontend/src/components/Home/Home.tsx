import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../assets/Button";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ImageList from "../ImageList/ImageList";
import UploadImageModal from "../UploadImageModal/UploadImageModal";
import SingleImage from "../SingleImage/SingleImage";
import axios from "../../axiosConfig";
import Loader from "../../assets/Loader";
import EditSingleImage from "../EditSingleImage/EditSingleImage";
import { toast } from "react-toastify";
import Dialog from "../../assets/Dialog";
import { Upload, X, Trash2 } from "lucide-react";

interface SingleImage {
  _id: string;
  order: number;
  title: string;
  imageKey: string;
  url: string;
}

function Home() {
  const [loading, setLoading] = useState(false);
  const [uploadImageModal, setUploadImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<SingleImage | {}>({});
  const [openSingleImage, setOpenSingleImage] = useState(false);
  const [openEditImage, setOpenEditImage] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<string[]>([]);
  const [images, setImages] = useState([]);
  const [dialog, setDialog] = useState<any>(null);
  const containerRef = useRef(null);

  useEffect(() => {
    getImages();
  }, []);

 
  const getImages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/images");
      setImages(data.images);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images).sort(
      (a: any, b: any) => a.order - b.order
    );

    const [reorderedItem] = items.splice(result.source.index, 1);

    items.splice(result.destination.index, 0, reorderedItem);

    const updatedImages: any = items.map((item: any, index) => {
      const newOrderedImage = {
        ...item,
        order: index + 1,
      };
      return newOrderedImage;
    });

    setImages(updatedImages);

    try {
      const updatedData = updatedImages.map((item: any) => ({
        _id: item._id,
        order: item.order,
      }));

      await axios.put("/images", { images: updatedData });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteImage = async () => {
    try {
      if (loading) return;
      if (itemsToDelete.length <= 0) return;
      setDialog(null);
      await axios.delete(`/images`, {
        params: {
          imageIds: itemsToDelete,
        },
      });
      getImages();
      setItemsToDelete([]);
      toast("Delete was successful");
    } catch (error) {
      setImages(images);
      console.log(error);
    }
  };

  const cancelDelete = () => {
    setItemsToDelete([]);
  };

  const handleOpenSingleImage = (image: SingleImage) => {
    setCurrentImage(image);
    setOpenSingleImage(true);
  };

  const handleOpenEditImage = (e: any, image: SingleImage) => {
    e.stopPropagation();
    setCurrentImage(image);
    setOpenEditImage(true);
  };

  const handleCloseSingleImage = () => {
    setOpenSingleImage(false);
    setCurrentImage({});
  };

  const handleCloseEditImage = () => {
    setOpenEditImage(false);
    setCurrentImage({});
  };

  const openDeleteDialog = () => {
    setDialog({
      message: "Are you sure you want to delete selected images ?",
      onCancel: () => setDialog(null),
      onSuccess: handleDeleteImage,
    });
  };

  const handleSearch = (e: any) => {
    const searchKey = e.target.value;
    const searchResult = images.filter(
      (image: SingleImage) =>
        image.title?.toLowerCase() === searchKey.toLowerCase()
    );
    setImages(searchResult);
  };

  const sortedImages = useMemo(
    () => [...images].sort((a: any, b: any) => a.order - b.order),
    [images]
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <button
            onClick={() => setUploadImageModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <Upload className="h-5 w-5" />
            Upload Images
          </button>

          {itemsToDelete.length > 0 && (
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={cancelDelete}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                onClick={openDeleteDialog}
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Your Gallery {images.length > 0 && `(${images.length})`}
          </h1>
          <p className="text-gray-400">Drag and drop to reorder your images</p>
        </div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="images">
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className="space-y-4"
              >
                {sortedImages.map((image: any, index: number) => (
                  <Draggable
                    key={image._id}
                    draggableId={image._id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleOpenSingleImage(image)}
                      >
                        <ImageList
                          key={image._id}
                          image={image}
                          itemsToDelete={itemsToDelete}
                          setItemsToDelete={setItemsToDelete}
                          handleOpenEditImage={handleOpenEditImage}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        
        <div ref={containerRef}></div>
      </div>

      {uploadImageModal && (
        <UploadImageModal
          setUploadImageModal={setUploadImageModal}
          getImages={getImages}
          ref={containerRef}
        />
      )}
      {openSingleImage && (
        <SingleImage
          image={currentImage}
          handleCloseSingleImage={handleCloseSingleImage}
        />
      )}
      {openEditImage && (
        <EditSingleImage
          image={currentImage}
          setImages={setImages}
          handleCloseEditImage={handleCloseEditImage}
        />
      )}
      {dialog && (
        <Dialog
          message={dialog.message}
          onCancel={dialog.onCancel}
          onSuccess={dialog.onSuccess}
        />
      )}
    </div>
  );
}

export default Home;