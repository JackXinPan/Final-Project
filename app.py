
# Import depednancies
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect
import numpy as np
import joblib
import json 


from flask import Flask, jsonify, render_template, request
# from flask import Flask, jsonify, render_template

# # connect to db
# engine = create_engine("sqlite:///diseases.sqlite")

# # reflect db
# Base = automap_base()
# Base.prepare(engine, reflect=True)

# initialise app
app = Flask(__name__)

@app.route('/form')
def form():
    return render_template('form.html')


 
@app.route('/predict/', methods = ['POST', 'GET'])
def prediction():
    if request.method == 'GET':
        return f"The URL /data is accessed directly. Try going to '/form' to submit form"
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
        print(form_data)

        if br == "" or cl == "" or t30 == "" or turb == "" or cond == "" or pH == "" or colour == "":
            try:
        
                prediction = makeprediction(doserate, foc, uva, br,cl,t30,turb,cond,pH,colour,watertype)
                #pass prediction to template
                return render_template('data.html', prediction = prediction, form_data = form_json)
    
            except ValueError:
                return "Please Enter valid values"
        



def makeprediction(doserate, foc, uva, br,cl,t30,turb,cond,pH,colour,watertype):
        
    if br == "" or cl == "" or t30 == "" or turb == "" or cond == "" or pH == "" or colour == "":

        test_data = [doserate, foc, uva]

        test_data = np.array(test_data)
        test_data = test_data.reshape(1,-1)
        print(test_data)

        if watertype == "GW":

            file = open("models/GW_model_trimmed.pkl","rb")

                #load trained model
            trained_model = joblib.load("models/GW_model_trimmed.pkl")
                
                #predict
            prediction = trained_model.predict(test_data)


        elif watertype == "SW":
            file = open("models/SW_model_trimmed.pkl","rb")

                #load trained model
            trained_model = joblib.load("models/SW_model_trimmed.pkl")
                
                #predict
            prediction = trained_model.predict(test_data)


    else:

        test_data = [doserate, foc, uva, br,cl,t30,turb,cond,pH,colour]

        test_data = np.array(test_data)
        test_data = test_data.reshape(1,-1)
        print(test_data)

        if watertype == "GW":

            file = open("models/GW_model.pkl","rb")
                                #load trained model
            trained_model = joblib.load("models/GW_model.pkl")
                
                #predict
            prediction = trained_model.predict(test_data)


        elif watertype == "SW":
            file = open("models/SW_model.pkl","rb")
                                #load trained model
            trained_model = joblib.load("models/SW_model.pkl")
                
                #predict
            prediction = trained_model.predict(test_data)

        

        
    return prediction
    









# # api
# @app.route("/api")
# def diseasegroups():

#     # get entire table from database
#     Disease = Base.classes.DiseaseSummary

#     session = Session(engine)

#     results = session.query(Disease)
    
#     session.close()

#    #create list of dics for required data
#     disease_list = []

#     for result in results:
#         disease_dic = {}
#         disease_dic["Year"] = result.Year
#         disease_dic["Disease"] = result.Disease_Name
#         disease_dic["Infection_Rate"] = result.Infection_Rate
#         disease_dic["Location"] = result.Location
#         disease_dic["Disease_Group"] = result.Disease_Group
        
#         disease_list.append(disease_dic)
  
#     # make json readable 
#     return jsonify(disease_list)


if __name__ == '__main__':
    app.run(debug=True)
