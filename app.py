
# Import depednancies
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect
from datetime import timedelta

from flask import Flask, jsonify, render_template

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
def data():
    if request.method == 'GET':
        return f"The URL /data is accessed directly. Try going to '/form' to submit form"
    if request.method == 'POST':

               #get form data
        sepal_length = request.form.get('sepal_length')
        sepal_width = request.form.get('sepal_width')
        petal_length = request.form.get('petal_length')
        petal_width = request.form.get('petal_width')
        form_data = request.form
        return render_template('data.html',form_data = form_data)


# api
@app.route("/api")
def diseasegroups():

    # get entire table from database
    Disease = Base.classes.DiseaseSummary

    session = Session(engine)

    results = session.query(Disease)
    
    session.close()

   #create list of dics for required data
    disease_list = []

    for result in results:
        disease_dic = {}
        disease_dic["Year"] = result.Year
        disease_dic["Disease"] = result.Disease_Name
        disease_dic["Infection_Rate"] = result.Infection_Rate
        disease_dic["Location"] = result.Location
        disease_dic["Disease_Group"] = result.Disease_Group
        
        disease_list.append(disease_dic)
  
    # make json readable 
    return jsonify(disease_list)


if __name__ == '__main__':
    app.run(debug=True)
