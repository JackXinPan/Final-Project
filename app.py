
# Import depednancies

import numpy as np
import joblib
import json 

from flask import Flask, jsonify, render_template, request


# initialise app
app = Flask(__name__)

@app.route('/')
def form():
    return render_template('index.html')
 
@app.route('/data/', methods = ['POST', 'GET'])
def prediction():
    if request.method == 'GET':
        return f"The URL /data is accessed directly. Try going to '/' to submit form"
    if request.method == 'POST':

        #get form data
        doserate = request.form.get('doserate')
        foc = request.form.get('foc')
        uva = request.form.get('uva')
        br = request.form.get('br')
        cl = request.form.get('cl')
        t30 = request.form.get('t30')
        turb = request.form.get('turb')
        cond = request.form.get('cond')
        pH = request.form.get('pH')
        colour = request.form.get('colour')
        watertype = request.form.get('watertype')
        form_data = request.form.to_dict(flat=True)
        form_json = json.dumps(form_data) 

        if br == "" or cl == "" or t30 == "" or turb == "" or cond == "" or pH == "" or colour == "":
            try:
        
                prediction = makeprediction(doserate, foc, uva, br,cl,t30,turb,cond,pH,colour,watertype)
                #pass prediction to template
                return render_template('data.html', prediction = prediction, form_data = form_json)
    
            except ValueError:
                return "Please Enter valid values"
        


# prediction fucntion
def makeprediction(doserate, foc, uva, br,cl,t30,turb,cond,pH,colour,watertype):

    # trimmed data
    if br == "" or cl == "" or t30 == "" or turb == "" or cond == "" or pH == "" or colour == "":

        test_data = [float(doserate), float(foc), float(uva), 0, 0, 0, 0, 0, 0, 0]

        test_data = np.array(test_data)
        test_data = test_data.reshape(1,-1)
        print(test_data)

        if watertype == "GW":

            #load trained model
            trained_model = joblib.load("models/GW_model_trimmed.pkl")

            #load scaler
            scaler = joblib.load("models/GW_scaler.pkl")
            
            #scale data
            scaled_data = scaler.transform(test_data)

            #trim and reshape data
            scaled_data = np.array(scaled_data[0][0:3])
            scaled_data = scaled_data.reshape(1,-1)

            #predict
            prediction = trained_model.predict(scaled_data)


        elif watertype == "SW":

            #load trained model
            trained_model = joblib.load("models/SW_model_trimmed.pkl")

            #load scaler
            scaler = joblib.load("models/SW_scaler.pkl")

            #scale data
            scaled_data = scaler.transform(test_data)

            #trim and reshape data
            scaled_data = np.array(scaled_data[0][0:3])
            scaled_data = scaled_data.reshape(1,-1)
                
            #predict
            prediction = trained_model.predict(scaled_data)

    # full data set
    else:
        test_data = [float(doserate), float(foc), float(uva), float(br), float(cl), float(t30), float(turb), float(cond), float(pH), float(colour)]

        test_data = np.array(test_data)
        test_data = test_data.reshape(1,-1)
        print(test_data)

        if watertype == "GW":

            #load trained model
            trained_model = joblib.load("models/GW_model.pkl")
            
            scaler = joblib.load("models/GW_scaler.pkl")

            scaled_data = scaler.transform(test_data)

                
            #predict
            prediction = trained_model.predict(scaled_data)


        elif watertype == "SW":

            #load trained model
            trained_model = joblib.load("models/SW_model.pkl")

            scaler = joblib.load("models/SW_scaler.pkl")

            scaled_data = scaler.transform(test_data)

                
            #predict
            prediction = trained_model.predict(scaled_data)

        
    return prediction
    



if __name__ == '__main__':
    app.run(debug=True)
