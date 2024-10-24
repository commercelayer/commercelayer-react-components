export async function getPublicIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error fetching public IP address:', error)
    return ''
  }
}
