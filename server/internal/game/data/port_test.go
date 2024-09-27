package data

import (
	"testing"
)

func TestGeneratePorts(t *testing.T) {
	ports := GeneratePorts(9)

	// fmt.Println(ports)

	if len(ports) != 9 {
		t.Errorf("Expected 9 ports, got %v", len(ports))
	}
}
