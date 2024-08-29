import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet, ImageBackground } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { getUsersMonthlySignupCounts } from '../db/database';

export default function DashboardScreen() {
  const [signupData, setSignupData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSignupData() {
      try {
        const data = await getUsersMonthlySignupCounts();
        console.log('data:::::::::::', data);
        
        setSignupData(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }

    fetchSignupData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  const screenWidth = Dimensions.get('window').width;

  // Mapping month indices to month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labels = signupData.map(entry => monthNames[entry.month - 1]);

  return (
    <ImageBackground
      source={require('../assets/AppBG.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.chartContainer}>
          <View style={styles.chartBox}>
            <Text style={styles.chartTitle}>Performance Matrix</Text>
            <BarChart
              data={{
                labels: labels,
                datasets: [{
                  data: signupData.map(entry => entry.count)
                }]
              }}
              width={screenWidth - 50}
              height={250}
              yAxisLabel=""
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#919191',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(245, 92, 32,  ${opacity})`,   // Darker orange color for bars
                style: {
                  borderRadius: 16
                },
                propsForBackgroundLines: {
                  strokeDasharray: "", // Remove dashes
                  strokeWidth: 1,
                  stroke: "#e3e3e3" // Color for the grid lines
                },
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,// Color for the labels (black)
              }}
              style={styles.chart}
              showBarTops={false}
              showValuesOnTopOfBars={true}
              fromZero={true} // Start y-axis from zero
              barPercentage={0.5} // Adjust bar width
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  chartContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center'
  },
  chartBox: {
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  chartTitle: {
    fontWeight: "bold",
    color: "#0a0300",
    fontSize: 18,
    marginBottom: 8,
  },
  chart: {
    marginTop: 8,
    borderRadius: 16,
  }
});
