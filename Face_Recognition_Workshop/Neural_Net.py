import numpy as np
import sys
"""
    This file is an implementation of a 2 layer
    neural network for facial recognition.
"""
class Neural:
    def __init__(self, 
                 input_size, # size of the picture we will be working with
                 learning_rate = 0.875, # used for a supervised learning process called [Gradient Descent]
                 loops = 200,
                 batch_size = 32): # number of loops to run our training
        self.Weights = np.random.randn(input_size)
        self.Bias = 1
        self.loops = loops # formally known as epochs for each loop through training data
        self.learning_rate = learning_rate
        self.batch_size = batch_size

    def activation_function(self, x):
        return 1 / (1 + np.exp(-x))
    
    def prediction(self, input):
        # basic prediction method: this method does not work well enough in python as this causes overflows when conducting the sums
        # out = self.Bias
        # for i in range(len(input)):
        #     out += input[i] * self.Weights[i]
        # # dot product: 
        # print(f"general output: {out}")
        # np_out = np.dot(input, self.Weights) + self.Bias
        # print(f"general output: {np_out}") # this one is faster since C code is being used for numpy operations
        return self.activation_function(np.dot(input, self.Weights) + self.Bias)
    
    def get_accuracy(self, predictions, labels):
        return np.mean(predictions == labels) * 100

    def train_Neural_Net(self, img_train_list, train_ans_key, img_Test, test_ans_key):
        # Supervised learning process starts here
        max_accuracy = 0
        for loop in range(self.loops):
            # shuffle the data along with the answers to provide a better testing environment and avoid overfitting based on routine
            img_train_list, train_ans_key = self.shuffle_data(img_train_list, train_ans_key) 
            for batch_start in range(0, len(img_train_list), self.batch_size):
                batch_input = img_train_list[batch_start:batch_start+self.batch_size]
                batch_labels = train_ans_key[batch_start:batch_start+self.batch_size]
                for img in range(len(batch_input)):
                    input = batch_input[img].flatten()
                    output = self.prediction(input)
                    update = self.learning_rate * (batch_labels[img] - output)
                    self.Weights += update * input
                    self.Bias += update
        accuracy = self.test_Neural_Net(img_Test, test_ans_key)
        if max_accuracy < accuracy:
            max_accuracy = accuracy
            print(f'Epoch {loop + 1}, Validation Accuracy: {accuracy:.2f}')
    
    def shuffle_data(self, img_data, labels):
        indices = np.arange(img_data.shape[0])
        # print(indices)
        np.random.shuffle(indices)
        return img_data[indices], labels[indices]
    
    def test_Neural_Net(self, test_img_data, test_labels):
        predictions = [self.prediction(img.flatten()) for img in test_img_data]
        accuracy = np.mean([predict == ans for predict, ans in zip(predictions, test_labels)])
        print(f"Training epoch {loop + 1} of {self.loops}")
        return accuracy
    
    def test_image(self, test_img_data, test_label):
        np.set_printoptions(threshold=sys.maxsize)
        prediction = self.prediction(test_img_data.flatten())
        print(f"output prediction: {bool(prediction)}")
        print(f"label: {bool(test_label)}")
        error = test_label - prediction
        print(f"Error: {bool(error)}")

    def validate(self, img_data, labels):
        acc = self.test_Neural_Net(img_data, labels)
        print(f"Test Accuracy: {acc:.2f}")

    def test_one_image(self, test_imgs, test_labels):
        np.set_printoptions(threshold=sys.maxsize)
        index = np.random.randint(0, len(test_imgs))
        # print(test_imgs[index])
        # print(self.Weights)
        # print(len(self.Weights))
        output = bool(self.prediction(test_imgs[index]))
        error = bool(test_labels[index] - output)
        print(f"index: {index}")
        print(f"prediction: {output}")
        print(f"label: {bool(test_labels[index])}")
        print(f"Error: {error}")