from pathlib import Path
import numpy as np
import img_prep as ip
import Neural_Net as NN
"""
    This file is meant to manage all files within the Neural Network program.
    The objective of this part of the program is to allow anyone to access the 
    data to train and test their Neural Network models locally.
"""
CURRENT_PATH = Path(__file__).parent # used to ensure access to the correct files from anywhere in your current working directory 
FILENAME = "Neural_Face_Recon_"
# list comprehension filter out files and keep folders, also changes found items into strings to account for Windows users
dir_list = [str(i) for i in CURRENT_PATH.iterdir() if Path.is_dir(i)] 

def data_retrieve():
    face_path = [Path(i) for i in dir_list if i.rfind("facedata") != -1].pop()
    face_path = [i for i in face_path.iterdir()]

    test_images_path = ip.ascii_prep(face_path[0]) 
    test_labels_path = ip.load_labels(face_path[1])
    training_images_path = ip.ascii_prep(face_path[2])
    training_labels_path = ip.load_labels(face_path[3])
    validation_images_path = ip.ascii_prep(face_path[4])
    validation_labels_path = ip.load_labels(face_path[5])
    return test_images_path, test_labels_path, training_images_path, training_labels_path, validation_images_path, validation_labels_path

def find_file(filename:str): # finds the value of the file given by the user to test their model
    path = [Path(i) for i in dir_list if i.rfind("images") != -1].pop() # using list comprehension to filter out directories that include the word images
    extensions = [".jpg", ".png"] # adding constraints to the supported file extensions for this program
    test_path = str(path / filename) # keeps the previous directory values that lead up to the images directory
    for img in path.iterdir():
        if test_path+extensions[0] == str(img):
            return (test_path + extensions[0])
        elif test_path+extensions[1] == str(img):
            return (test_path + extensions[1]) # returning the name of the file and the extension of the file it was found as
    else: # fun fact: python allows else statements after for loops  
        return "Error: file not found"

def save(NN:NN.Neural, accuracy):
    models_dir = [Path(i) for i in dir_list if i.rfind("models") != -1].pop()
    model_file_name = f"{FILENAME}{int(accuracy*100)}"
    file_ext = ".npz" # this is the file extension of the numpy model you train
    existing_files = list(models_dir.rglob(model_file_name + "*" + file_ext)) # retrieves the list of all versions of models saved

    # Extract the max number from existing files
    if existing_files:
        copy_num = max([int(file.stem.split("_")[-1]) for file in existing_files if file.stem.count("_") > 1 and int(file.stem.split("_")[-1]) != int(accuracy*100)], default=0) + 1
    else:
        copy_num = 0

    new_model_file_name = f"{model_file_name}_{copy_num}.npz" if copy_num > 0 else f"{model_file_name}.npz" # currently there is a bug here that gives multiple accuracies in the model when saving copies

    model_path = models_dir / new_model_file_name
    np.savez(model_path, weights=NN.Weights, bias=NN.Bias)

@staticmethod
def load_model(file_path):
    data = np.load(file_path)
    num_features = data["weights"].shape[0] # finds the length of the outer array from the dictionary
    model = NN.Neural(num_features) # creating a Neural Network object based on the weight length loaded
    model.Weights = data["weights"]
    model.Bias = data["bias"]
    return model

if __name__ == '__main__':
    train_data, train_label, valid_data, valid_labels, test_data, test_label = data_retrieve()
    
    steps = input("Do you want to train or load a Neural Network model? (train/load): ")
    while steps.lower() not in ["train", "load"]:
        print("Error: Incorrect command")
        steps = input("Do you want to train or load a Neural Network model? (train/load): ")
    
    if (steps == 'train'):
        Neural_Net = NN.Neural(input_size=(ip.FACE_DATUM_HEIGHT * ip.FACE_DATUM_WIDTH)) # creating a Neural Network object, of our given constant input size 
        Neural_Net.train_Neural_Net(train_data, train_label, test_data, test_label) # calling on training function
        accuracy = Neural_Net.test_Neural_Net(valid_data, valid_labels) # validating our model to find our testing accuracy
        print(f"Validation Accuracy: {accuracy:.2f}")
        steps = input("Do you want to save this model? (Y/N): ")
        while(steps.capitalize() not in ["Y", "N"]): # prevents accidental loss of your model
            print("Error: Incorrect command")
            steps = input("Do you want to save this model? (Y/N): ")
        if(steps.capitalize() == 'Y'):
            save(Neural_Net, accuracy)
    else: # loading phase of the neural network
        file_path = input("Enter the number of your model: ")
        file_path = FILENAME + file_path
        if not file_path.endswith(".npz"):
            file_path += ".npz"
        models_dir = [Path(i) for i in dir_list if i.rfind("models") != -1].pop()
        
        current_path = models_dir / file_path
        while not current_path.is_file():
            file_path = input("Error: File does not exist.\nEnter the number of your model: ")
            if not file_path.endswith(".npz"):
                file_path += ".npz"
            current_path = models_dir / file_path
        Neural_Net = load_model(current_path)
    Neural_Net.test_one_image(test_data, test_label)

    check = input("Do you want to continue testing your model? (Y/N): ")
    while(check.capitalize() not in ["Y", "N"]): # prevents accidental loss of your model
        print("Error: Incorrect command")
        check = input("Do you want to continue testing your model? (Y/N): ")
    while(check.capitalize() == "Y"):
        file = input("Enter the name of the photo to test your model with: ")
        while(find_file(file) == "Error: file not found"):
            file = input("enter the name of the photo to test your model with: ")
        
        answer = input("Is this photo you are using a face or not (Y/N): ")
        while(answer.capitalize() not in ['Y','N']):
            answer = input("Is this photo you are using a face or not? (Y/N): ")
        answer = 1 if answer.capitalize == "Y" else 0  
 
        test = ip.image_prep(file)
        Neural_Net.test_image(test, answer) # testing the value of the 
        check = input("Do you want to continue testing your model? (Y/N): ")