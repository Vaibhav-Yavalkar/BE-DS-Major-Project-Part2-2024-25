import dash
from dash import dcc, html
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from dash.dependencies import Input, Output

# Initialize the Dash app
app = dash.Dash(__name__)

# Load data from the CSV files
data = pd.read_csv('ICRISAT-District Level Data.csv')
rainfall_data = pd.read_csv('data/rainfall.csv')

# Predefined color mapping for crops (ensure consistency)
color_map = {
    "Rice": '#ff6666',
    "Wheat": '#66b3ff',
    "Cotton": '#ffcc99',
    "Sugarcane": '#66ff66',
    "Fruits": '#ff99ff',
    "Vegetables": '#c2f0f0',
}

# Aggregating the data for crops (total area and production)
aggregated_data = data.groupby("Year").sum()

# Total land area for ring chart (sum of all available crop area)
total_land_area = aggregated_data['RICE AREA (1000 ha)'].sum() + aggregated_data['WHEAT AREA (1000 ha)'].sum()
cultivated_area = total_land_area  # Here total cultivated area is the sum of rice and wheat
unused_area = total_land_area * 0.2  # Assuming 20% of land is unused

# Function to create a line chart for Rainfall
def create_rainfall_chart(df, y_column, title, y_label):
    fig = px.line(
        df,
        x='YEAR',
        y=y_column,
        title=title,
        labels={'YEAR': 'Year', y_column: y_label},
        markers=True
    )
    fig.update_layout(hovermode="x unified")
    return fig

# Layout for the dashboard
app.layout = html.Div(style={'backgroundColor': '#f0f8ff', 'padding': '20px'}, children=[
    html.H1("CropSync Dashboard", style={'textAlign': 'center', 'color': '#333'}),

    # Row for charts
    html.Div(style={'display': 'flex', 'flexWrap': 'wrap', 'justifyContent': 'space-between'}, children=[
        # Infographic Percentage Ring for Land Area
        html.Div([
            html.Div("Total Area of Farmland", style={'textAlign': 'center', 'fontSize': '16px', 'margin-bottom': '10px'}),
            dcc.Dropdown(
                id='farmland-dropdown',
                options=[{'label': 'Overall', 'value': 'Overall'}],
                value='Overall',  # Default value
                clearable=False,
                style={'width': '80%', 'margin': '0 auto'}  # Centered width
            ),
            dcc.Graph(
                id='land-area-ring',
                style={'height': '400px', 'width': '100%'}  # Increased height and set width to 100%
            )
        ], style={'flex': '1 1 45%', 'padding': '10px', 'border': '1px solid #ccc', 'border-radius': '5px', 'backgroundColor': '#fff', 'margin': '10px'}),
        
        # Crops grown pie chart with dropdown
        html.Div([
            html.Div("Crops Grown by Year", style={'textAlign': 'center', 'fontSize': '16px', 'margin-bottom': '10px'}),
            dcc.Dropdown(
                id='year-dropdown',
                options=[{'label': str(year), 'value': year} for year in data['Year'].unique()],
                value=data['Year'].min(),  # Default value
                clearable=False,
                style={'width': '80%', 'margin': '0 auto'}
            ),
            dcc.Graph(
                id='pie-chart',
                style={'height': '400px', 'width': '100%'}  # Increased height and set width to 100%
            )
        ], style={'flex': '1 1 45%', 'padding': '10px', 'border': '1px solid #ccc', 'border-radius': '5px', 'backgroundColor': '#fff', 'margin': '10px'}),
        
        # Bar chart for Crop Area by Year
        html.Div([
            dcc.Graph(id='bar-chart', style={'height': '300px'}),
        ], style={'flex': '1 1 45%', 'padding': '10px', 'border': '1px solid #ccc', 'border-radius': '5px', 'backgroundColor': '#fff', 'margin': '10px'}),

        # Rainfall line chart with dropdown
        html.Div([
            html.Div("Rainfall Over the Years", style={'textAlign': 'center', 'fontSize': '16px', 'margin-bottom': '10px'}),
            dcc.Dropdown(
                id='rainfall-dropdown',
                options=[
                    {'label': 'Annual Rainfall', 'value': 'ANN'},
                    {'label': 'Jan-Feb Rainfall', 'value': 'Jan-Feb'},
                    {'label': 'Mar-May Rainfall', 'value': 'Mar-May'},
                    {'label': 'Jun-Sep Rainfall', 'value': 'Jun-Sep'},
                    {'label': 'Oct-Dec Rainfall', 'value': 'Oct-Dec'}
                ],
                value='ANN',
                clearable=False,
                style={'width': '80%', 'margin': '0 auto'}
            ),
            dcc.Graph(
                id='rainfall-chart',
                style={'height': '300px'}
            )
        ], style={'flex': '1 1 45%', 'padding': '10px', 'border': '1px solid #ccc', 'border-radius': '5px', 'backgroundColor': '#fff', 'margin': '10px'}),
    ]),
])

# Callback to update farmland chart based on selection
@app.callback(
    Output('land-area-ring', 'figure'),
    Input('farmland-dropdown', 'value')
)
def update_land_area(selected_farmland):
    land_area_ring = go.Figure(
        data=[go.Pie(
            labels=["Cultivated Area", "Unused Area"],
            values=[cultivated_area, unused_area],
            hole=0.4,
            marker=dict(colors=['#66c2a5', '#fc8d62'], line=dict(color='#000000', width=2)),
            textinfo='percent',
        )]
    )
    return land_area_ring

# Callback to update crops pie chart based on year selection
@app.callback(
    Output('pie-chart', 'figure'),
    Input('year-dropdown', 'value')
)
def update_crops(selected_year):
    year_data = data[data['Year'] == selected_year]
    pie_data = pd.DataFrame({
        'Product': ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Fruits', 'Vegetables'],
        'Area (1000 ha)': [
            year_data['RICE AREA (1000 ha)'].sum(),
            year_data['WHEAT AREA (1000 ha)'].sum(),
            year_data['COTTON AREA (1000 ha)'].sum(),
            year_data['SUGARCANE AREA (1000 ha)'].sum(),
            year_data['FRUITS AREA (1000 ha)'].sum(),
            year_data['VEGETABLES AREA (1000 ha)'].sum()
        ]
    })

    pie_chart = go.Figure(
        data=[go.Pie(
            labels=pie_data['Product'],
            values=pie_data['Area (1000 ha)'],
            hole=0.4,
            marker=dict(colors=[color_map.get(crop, '#cccccc') for crop in pie_data['Product']], line=dict(color='#000000', width=2)),
            textinfo='percent',
        )]
    )

    return pie_chart

# Callback to update rainfall chart based on dropdown selection
@app.callback(
    Output('rainfall-chart', 'figure'),
    Input('rainfall-dropdown', 'value')
)
def update_rainfall_chart(selected_rainfall):
    return create_rainfall_chart(rainfall_data, selected_rainfall, 'Rainfall Over the Years', 'Rainfall (mm)')

# Callback to update bar chart based on year selection
@app.callback(
    Output('bar-chart', 'figure'),
    Input('year-dropdown', 'value')
)
def update_bar_chart(selected_year):
    year_data = data[data['Year'] == selected_year]
    bar_data = pd.DataFrame({
        'Product': ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Fruits', 'Vegetables'],
        'Area (1000 ha)': [
            year_data['RICE AREA (1000 ha)'].sum(),
            year_data['WHEAT AREA (1000 ha)'].sum(),
            year_data['COTTON AREA (1000 ha)'].sum(),
            year_data['SUGARCANE AREA (1000 ha)'].sum(),
            year_data['FRUITS AREA (1000 ha)'].sum(),
            year_data['VEGETABLES AREA (1000 ha)'].sum()
        ]
    })

    bar_chart = px.bar(
        bar_data,
        x='Product',
        y='Area (1000 ha)',
        title='Crop Area by Year',
        labels={'Area (1000 ha)': 'Area in 1000 ha'},
        color='Product',
        color_discrete_map=color_map
    )
    
    return bar_chart

# Run the app
if __name__ == '__main__':
    app.run_server(debug=True)
